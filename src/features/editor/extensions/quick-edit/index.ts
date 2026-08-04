import {EditorState, StateEffect,StateField} from "@codemirror/state"
import {Decoration,DecorationSet,EditorView,Tooltip,ViewPlugin,ViewUpdate,WidgetType,keymap, showTooltip}  from "@codemirror/view"
import { fetcher } from "./fetcher"

export const showQuickEditState = StateEffect.define<boolean>()

let editorView:EditorView | null = null;
let currentAbortController :AbortController | null = null;

export const qucickEditState = StateField.define<boolean>({
    create(){
        return false
    },
    update(value,transaction){
        console.log("transaction,value",transaction.effects,value);
        console.log("transaction-selection",transaction.selection);
        for(const effect of transaction.effects){ 
            if (effect.is(showQuickEditState)) {
                return effect.value
            }
        }
       if (transaction.selection) {
        const selection = transaction.state.selection.main
        console.log("selection",selection);
        if (selection.empty) {
            return false
        }
       }
       return value
    }
})

const createQuickEditTooltipField = (state:EditorState):readonly Tooltip[]=>{
      console.log("state",state);
    const selection = state.selection.main
     console.log("selection",selection);
    if(selection.empty)
    {
        console.log("true");
        return [];
    }

    const isQuickEditActive = state.field(qucickEditState);
     console.log("isQuickEditActive",isQuickEditActive);
    if (!isQuickEditActive) {
        return []
    }

  const value =  [
        {
            pos:selection.to,
            above:false,
            strictSide:false,
            create(){
                const dom = document.createElement("div")
                dom.className="bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm"

                const form = document.createElement("form")
                form.className = "flex flex-col gap-2"

                const input = document.createElement("input")
                input.type = "text";
                input.placeholder="Edit selected code";
                input.className="bg-transparent border-none outline-none px-2 py-2 font-sans w-100"
                input.autofocus=true

                const buttonContainer = document.createElement("div");
                buttonContainer.className = "flex items-center justify-between gap-2"

                const cancelButton = document.createElement("button")
                cancelButton.type = "button"
                cancelButton.textContent = "cencel"
                cancelButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm"
                cancelButton.onclick = ()=>{
                    if (currentAbortController) {
                        currentAbortController.abort();
                        currentAbortController = null
                    }

                    if (editorView) {
                        editorView.dispatch({
                            effects:showQuickEditState.of(false)
                        })
                    }
                }


                const submitButton = document.createElement("button")
                submitButton.type = "submit"
                submitButton.textContent = "submit"
                submitButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm"


                form.onsubmit = async(e)=>{
                 e.preventDefault();
                 if (!editorView) {
                    return
                 }

                 const instruction =input.value.trim();
                 if (!instruction) {
                    return
                 }

                 const selection = editorView.state.selection.main;
                 console.log("selection",selection);
                 const selectedCode = editorView.state.doc.sliceString(selection.from,selection.to)
                console.log("selectcode",selectedCode);
                 const fullcode = editorView.state.doc.toString(); 
                 console.log("fullcode",fullcode);
                 submitButton.disabled = true
                 submitButton.textContent = "Editing..."

                 currentAbortController = new AbortController()

                 const editedcode =await fetcher(
                    {
                    selectedCode,
                    fullcode,
                    instruction
                    },
                    currentAbortController.signal
            )
             console.log("editedcode",editedcode)
            if (editedcode) {
                editorView.dispatch({
                    changes:{
                        from:selection.from,
                        to:selection.to,
                        insert:editedcode
                    },
                    selection:{
                        anchor:selection.from + editedcode.length
                    },
                    effects:showQuickEditState.of(false)
                })
            }else{
                submitButton.disabled = false
                submitButton.textContent = "Submit"
            }

            currentAbortController = null;
                }

                buttonContainer.appendChild(cancelButton)
                buttonContainer.appendChild(submitButton)

                form.appendChild(input)
                form.appendChild(buttonContainer)
                dom.appendChild(form)

                setTimeout(() => {
                    input.focus()
                }, 0);

                return {dom};
            }
        }
    ]

    console.log("value1",value);
    return value

}

const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
    create(state){
        console.log("state",state);
        return createQuickEditTooltipField(state)
    },
    update(Tooltips,transaction){
        console.log("tooltip",Tooltips);
        console.log("transaction-docchanged",transaction.docChanged,"transaction-selection",transaction.selection,"tranaction-state",transaction.state);
        console.log("transaction-effect",transaction.effects);

      if (transaction.docChanged || transaction.selection) {
        return createQuickEditTooltipField(transaction.state)
      }

      console.log("transaction-effect",transaction.effects);
      for(const effect of transaction.effects){
      console.log("transaction-effect",transaction.effects);
      console.log("effect.is",effect.is(showQuickEditState));
      
        if (effect.is(showQuickEditState)) {
            console.log("transaction-state",transaction.state);
            return createQuickEditTooltipField(transaction.state)
        }
      }

      return Tooltips;

    },
    provide:(field)=>showTooltip.computeN(
        [field],
        (state)=>state.field(field)
    )

})

const quickEditKeyMap = keymap.of([
    {
        key:"Mod-k",
        run:(view)=>{
            const selection = view.state.selection.main
           console.log("selection",selection);
            if (selection.empty) {
                return false
            }

            view.dispatch({
                effects:showQuickEditState.of(true)
            })
            return true;
        }
    }
])

const captureViewExtension = EditorView.updateListener.of((update)=>{
    editorView = update.view
})

export const quickEdit = (fileName:string)=>{
   return [
      qucickEditState,
      quickEditTooltipField,
      quickEditKeyMap,
      captureViewExtension
   ]
}