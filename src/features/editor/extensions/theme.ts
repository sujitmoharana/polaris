import {EditorView} from "codemirror"

export const customTheme = EditorView.theme({
    "&":{
        outline:"none !important",
        //height:"100%"
    },
    ".cm-content":{
        fontfamily:"var(--font-geist-mono),monospace",
        fontsize:"14px"
    },
    ".cm-scroller":{
       scrollbarWidth:"thin",
       scrollbarColors:"#3f3f46 transparent"
    }
})