import React, { useEffect, useMemo, useRef } from 'react'
import {EditorView, keymap} from "@codemirror/view"
import {basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {oneDark} from "@codemirror/theme-one-dark"
import { customTheme } from '../extensions/theme'
import { getLanguageExtension } from '../extensions/language-extension'
import {indentWithTab} from "@codemirror/commands"
import { FileSignal } from 'lucide-react'
import { minimap } from '../extensions/minimap'
import {indentationMarkers} from "@replit/codemirror-indentation-markers"
import { customSetup } from '../extensions/custom-setup'
import { suggestion } from '../extensions/suggestion'
import { quickEdit } from '../extensions/quick-edit'
import { selectionTooltip } from '../extensions/selection-tooltip'
interface props{
  fileName:string,
  initialValue:string,
  onChange:(value:string)=>void
}
const CodeEditor = ({fileName,initialValue,onChange}:props) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const viewref = useRef<EditorView|null>(null)

    const languageExtension = useMemo(()=>getLanguageExtension(fileName),[fileName])
    useEffect(() => {
      if(!editorRef.current) return;

      const view = new EditorView({
        doc:initialValue,
        parent:editorRef.current,
        extensions:[
          oneDark,
          customTheme,
          customSetup,
          languageExtension,
          suggestion(fileName),
          quickEdit(fileName),
          selectionTooltip(),
          keymap.of([indentWithTab]),
          minimap(),
          indentationMarkers(),
          EditorView.updateListener.of((update)=>{
            if (update.docChanged) {
              console.log("updateChnaged",update.state.doc.toString());
              onChange(update.state.doc.toString())
            }
          })
        ]  
      })

      viewref.current = view;
      return ()=>{
        console.log("destroy");
        view.destroy();
      }
    }, [languageExtension])
    
  return (
    <div ref={editorRef} className='size-full pl-4 bg-background'/>
  )
}

export default CodeEditor