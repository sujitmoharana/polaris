import React, { useEffect, useRef } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import Topnavigation from './top-navigation'
import { useEditor } from '../hook/use-editor'
import FileBreadcrumbs from './file-breadcrumbs'
import { useFile, useUpadatefile } from '@/features/projects/components/hooks/use-files'
import Image from 'next/image'
import CodeEditor from './code-editor'

const EditorView = ({projectId}:{projectId:Id<"projects">}) => {
  const {activeTabId} = useEditor(projectId);
  const activeFile = useFile(activeTabId)
  console.log("activefil",activeFile);
  const updateFile = useUpadatefile()
  const timeoutref = useRef<NodeJS.Timeout | null>(null)
   const isActiveFileBinary = activeFile && activeFile.storageId;
   const isActiveFileText = activeFile && !activeFile.storageId;

   useEffect(() => {
     return () => {
       if (timeoutref.current) {
        clearTimeout(timeoutref.current)
       }
     }
   }, [activeTabId])
   

  return (
    <div className='h-full flex flex-col'>
       <div className='flex items-center'>
         <Topnavigation projectId={projectId} />
       </div>
       {activeTabId && <FileBreadcrumbs projectId={projectId} />}
       <div className='fleex-1 h-full w-full bg-background'>
         {!activeFile && (
          <div className='size-full flex items-center justify-center'>
          <Image src="/logo.svg" alt='polaris' width={50} height={50} className='opacity-100' />
          </div>
         )}

         {activeFile && (
          <CodeEditor fileName={activeFile.name} key={activeFile._id} initialValue={activeFile.content ?? ""} onChange={(content:string)=>{
            if (timeoutref.current) {
              clearTimeout(timeoutref.current)
            }

            timeoutref.current = setTimeout(() => {
              updateFile({id:activeFile._id,content:content})
            }, 1500);
          }}/>
         )}

         {
          isActiveFileBinary && (
            <p>TODO:Implement binary preview</p>
          )
         }

       </div>
    </div>
  )
}

export default EditorView