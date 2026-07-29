import {StateEffect,StateField} from "@codemirror/state"
import {Decoration,DecorationSet,EditorView,ViewPlugin,ViewUpdate,WidgetType,keymap}  from "@codemirror/view"

//setSuggetionEffect a way to send "message" to update state
//we define one effect type for setting the suggestion text 
const setSuggetionEffect = StateEffect.define<string|null>()

//stateField: holds our suggestion state in the editor
//- create() : return the initial value when the editor loads
//- update():called on every transaction (keystroke,etc) to potentially update the value
const suggetionState = StateField.define<string|null>({
    create(){
        return "TODO:create something"
    },
    update(value,transaction)
    {
        //check each effect in this transaction
        //if we find our setSuggetionefect , return its new value
        //otherwise ,keep the current value unchanged
        console.log("transaction,value",transaction.effects,value);
        for(const effect of transaction.effects){ 
            if (effect.is(setSuggetionEffect)) {
                return effect.value
            }
        }
        return value
    }
})

console.log("suggetionState",suggetionState);

//widgettype : create custom Dom element to display in the editor
//toDom():is called by codemirror to create the actual html element
class SuggestionWidget extends WidgetType{
   constructor(readonly text:string|null)
   {
    super()
   }  
   
   toDOM(){
    const span = document.createElement("span")
    span.textContent = this.text
    span.style.opacity= "0.4"
    span.style.pointerEvents= "none"
    return span;
   }
}






const renderPlugin = ViewPlugin.fromClass(
    class {
        decorations:DecorationSet
        constructor (view:EditorView){
            this.decorations = this.build(view)
        }

        update(update:ViewUpdate)
        {
            //rbuild decorations if doc is changed,cursor moved, or suggestion changed
            console.log("decoration",this.decorations);
            
            console.log("update",update.transactions);
            const suggetionChanged = update.transactions.some((transaction)=>
              transaction.effects.some((effect)=>effect.is(setSuggetionEffect))
            )

            console.log("suggetionChanged",suggetionChanged);

            const shouldRebuild = update.docChanged || update.selectionSet || suggetionChanged
        console.log("shouldRebuild",shouldRebuild);
            if (shouldRebuild) {
                this.decorations = this.build(update.view)
            }
        }

        build(view:EditorView){
            
            //get the current suggestion from state
            console.log("view",view);
            const suggetion = view.state.field(suggetionState)
            console.log("suggetion",suggetion);
            if (!suggetion) {
                return Decoration.none
            }

            //create a widget decoration at the cursor position
            const cursor = view.state.selection.main.head;
            console.log("cursor",cursor);
            
            return Decoration.set([
                Decoration.widget({
                    widget:new SuggestionWidget(suggetion),
                    side:1 //render this after cursor (side:1) , not before(side:-1)
                }).range(cursor)
            ])
        }
    }
    ,
    {
        //tell codemirror to use our decoration
        decorations : (Plugin)=>Plugin.decorations
    }
)

const acceptSuggestionKeymap = keymap.of([
   { 
    key:"Tab",
    run:(view)=>{
      const suggestion = view.state.field(suggetionState)
      if (!suggestion) {
        return false; //No suggestion ? let Tab do its normal things (indent)
      }
      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes:{from:cursor,insert:suggestion}, //insert the suggestion text
        selection:{anchor:cursor+suggestion.length}, //after insert move cursor to the end of the text
        effects:setSuggetionEffect.of(null)
      })
      return true; //we handle tab, not indent
    }
   },
   
])

export const suggestion = (fileName:string)=>{
   return [
       suggetionState, // our state storage
       renderPlugin, // render the ghost texts
       acceptSuggestionKeymap, // Tab to accept
   ]
}