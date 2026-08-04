import { EditorView, showTooltip, Tooltip } from "@codemirror/view";
import { EditorState, StateField } from "@codemirror/state";
import { qucickEditState, showQuickEditState } from "./quick-edit";
let editorView:EditorView | null = null;
const createTooltipForSelection = (state:EditorState):readonly Tooltip[]=>{
    const selection = state.selection.main

    if(selection.empty){
        return [];
    }

    const isQuickEditActive = state.field(qucickEditState)
    if(isQuickEditActive){
        return [];
    }

    return [
       { 
        pos:selection.to,
        above:false,
        strictSide:false,
        create(){
             const dom = document.createElement("div")
             dom.className = "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex gap-2 text-sm"

             const addToChatButton = document.createElement("button")
             addToChatButton.textContent = "Add to chat";
             addToChatButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm flex items-center gap-1"

             const quickEditButton = document.createElement("button")
             quickEditButton.className = "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm flex items-center gap-1"

             const quickEditButtonText = document.createElement("span")
             quickEditButtonText.textContent = "Quick Edit"
            
             const quickEditBUttonShortcut = document.createElement("span")
             quickEditBUttonShortcut.textContent = "ctrl+k"
             quickEditBUttonShortcut.className = "text-sm opacity-60"

             quickEditButton.appendChild(quickEditButtonText)
             quickEditButton.appendChild(quickEditBUttonShortcut)


            quickEditButton.onclick = ()=>{
                if(editorView){
                    editorView.dispatch({
                        effects:showQuickEditState.of(true)
                     })                        
                }
            }
            
            dom.appendChild(addToChatButton)
            dom.appendChild(quickEditButton)

            return {dom}
             
        }
    }
    ]

}

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
    create(state)
    {
       return createTooltipForSelection(state)
    },
    update(tooltip,transaction){
       if (transaction.docChanged || transaction.selection) {
        return createTooltipForSelection(transaction.state)
       }

       for(const effect of transaction.effects){
        if (effect.is(showQuickEditState)) {
            return createTooltipForSelection(transaction.state)
        }
       }
       return tooltip;
    },
    provide:(field) =>showTooltip.computeN(
        [field],
        (state)=>state.field(field)
    )
})



const captureViewExtension = EditorView.updateListener.of((update)=>{
    editorView = update.view;
})

export const selectionTooltip = ()=>[
    selectionTooltipField,
    captureViewExtension
]