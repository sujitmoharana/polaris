import {StateEffect,StateField} from "@codemirror/state"
import {Decoration,DecorationSet,EditorView,ViewPlugin,ViewUpdate,WidgetType,keymap}  from "@codemirror/view"
import { fetcher } from "./fetcher"

//setSuggetionEffect a way to send "message" to update state
//we define one effect type for setting the suggestion text 
const setSuggetionEffect = StateEffect.define<string|null>()

//stateField: holds our suggestion state in the editor
//- create() : return the initial value when the editor loads
//- update():called on every transaction (keystroke,etc) to potentially update the value
const suggetionState = StateField.define<string|null>({
    create(){
        return null;
    },
    update(value,transaction)
    {
        //check each effect in this transaction
        //if we find our setSuggetionefect , return its new value
        //otherwise ,keep the current value unchanged
        console.log("transaction,value",transaction.effects , value);
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

let debounceTimer:number|null = null;
let isWaittingForSuggestion =  false;
let DEBOUNCE_DELAY = 300

let currentAbortController:AbortController | null = null

const generateFakeSuggestion =(textBeforeCursor:string):string|null=>{
   const trimmed = textBeforeCursor.trimEnd();
   console.log("trimmed",trimmed);
   if (trimmed.endsWith("const")) return " myVariable = "; 
   if (trimmed.endsWith("function")) return " myFunction(){\n \n}"; 
   if (trimmed.endsWith("console.")) return "log()"; 
   if (trimmed.endsWith("return")) return "null";
   return null; 
}

const generatePayload = (view:EditorView,fileName:string)=>{
    const code = view.state.doc.toString();
    if (!code || code.trim().length ===0) {
        return null
    }

    const cursorPosition = view.state.selection.main.head;
    console.log("cursorPosition",cursorPosition);
    
    const currentLine = view.state.doc.lineAt(cursorPosition)
    console.log("currentLine",currentLine);
     console.log("currentLine",currentLine.number);
     
    const cursorInline = cursorPosition - currentLine.from;
    console.log("cursorInline",cursorInline);

    const previousLines:string[] = []

    const previousLinesToFetch = Math.min(5,currentLine.number-1)
    console.log("previousLinesToFetch",previousLinesToFetch);
    
    for(let i=previousLinesToFetch; i>=1;i--){
        console.log("1",view.state.doc.line(currentLine.number-i));
        console.log("2",view.state.doc.line(currentLine.number-i).text);
        previousLines.push(view.state.doc.line(currentLine.number-i).text);
    }
    console.log("previousLines",previousLines);
    

    const nextLines:string[] = []
    const totalLines = view.state.doc.line;
    console.log("totalLines",totalLines);
    const lineToFetch = Math.min(5,totalLines-currentLine.number)
    for(let i=1; i<=lineToFetch;i++){
        console.log("1",view.state.doc.line(currentLine.number+i));
        console.log("2",view.state.doc.line(currentLine.number+i).text);
        nextLines.push(view.state.doc.line(currentLine.number+i).text);
    }
    console.log("nextLines",nextLines);
    console.log("code",code);
    console.log("currentLine.text",currentLine.text);
    console.log("previousLines.join",previousLines.join("\n"));
    console.log("currentLine.text.slice(0,cursorInline)",currentLine.text.slice(0,cursorInline));
    console.log("currentLine.text.slice(cursorInline)",currentLine.text.slice(cursorInline));
    console.log("nextLines.join",nextLines.join("\n"));
    console.log("currentLine.number",currentLine.number);
     



    return{
        fileName,
        code,
        currentLine:currentLine.text,
        PreviousLines:previousLines.join("\n"),
        textBeforeCursor:currentLine.text.slice(0,cursorInline),
        textAfterCursor:currentLine.text.slice(cursorInline),
        nextLines:nextLines.join("\n"),
        lineNumber:currentLine.number


    }
}

const createDebouncePlugin = (filname:string)=>{
    return ViewPlugin.fromClass(
        class{
            constructor(view:EditorView){
                this.triggerSuggestion(view)
            }

            update(update:ViewUpdate){
                const shouldRebuild = update.docChanged || update.selectionSet
                if (shouldRebuild) {
                    this.triggerSuggestion(update.view)
                }
            }

            triggerSuggestion(view:EditorView){
                if (debounceTimer !== null) {
                    clearTimeout(debounceTimer)
                }
                console.log("currentAbortController",currentAbortController);
                

                if (currentAbortController !== null) {
                    console.log("aborted completed");
                    currentAbortController.abort()
                }

                isWaittingForSuggestion=true

                debounceTimer = window.setTimeout(async()=>{
                    console.log("view",view)
                   const payload = generatePayload(view,filname)
                   console.log("payload",payload);
                   
                   if (!payload) {
                    isWaittingForSuggestion = false
                    view.dispatch({effects:setSuggetionEffect.of(null)})
                    return;
                   } 

                   currentAbortController = new AbortController();
                   console.log("currentAbortController1",currentAbortController);
                   
                   const suggestion = await fetcher(payload,currentAbortController.signal);
                   console.log("suggestion",suggestion);
                   
                    isWaittingForSuggestion = false;

                    view.dispatch({
                        effects:setSuggetionEffect.of(suggestion)
                    })
                },DEBOUNCE_DELAY)
            }
            
            destroy(){
                console.log("destroy",this.destroy);
                if (debounceTimer !== null) {
                    clearTimeout(debounceTimer);
                }

                if (currentAbortController !== null) {
                    currentAbortController.abort()
                }
            }
        }

    )
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
            if (isWaittingForSuggestion) {
                return Decoration.none
            }
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
       createDebouncePlugin(fileName),//Trigger siggestion on typing
       renderPlugin, // render the ghost texts
       acceptSuggestionKeymap, // Tab to accept
   ]
}