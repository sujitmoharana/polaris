import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { useEditor } from '../hook/use-editor';
import { useFile } from '@/features/projects/components/hooks/use-files';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { FileIcon } from '@react-symbols/icons/utils';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

 const Tab = ({fileId,isFirst,projectId}:{fileId:Id<"files">,isFirst:boolean,projectId:Id<"projects">})=>{
    const file = useFile(fileId)
    const {activeTabId,previewTabId,setActiveTab,openFile,closeTab} = useEditor(projectId);
    const isActive = activeTabId === fileId;
    console.log("ISACTIVE",isActive)
    const isPreview = previewTabId ===fileId;
    console.log("ISPREVIEW",isPreview);
    const fileName = file?.name ?? "Loading..."
    const [isHovered, setIsHovered] = React.useState(false);

    return(
        <Button variant="ghost" className={cn("flex group items-center rounded-none gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r",isActive && "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",isFirst && "border-l-transparent")} 
        onClick={()=>setActiveTab(fileId)} onDoubleClick={()=>openFile(fileId,{pinned:true})}>
         {file === undefined ? (
            <Spinner className='text-ring'/>
         ):(
            <FileIcon autoAssign className='size-4' fileName={fileName}/>
         )}
         <span style={{
                fontStyle: isPreview ? "italic" : "normal"
            }} className={cn("text-sm whitespace-nowrap")} >
            {fileName}
         </span>
         <button onClick={(e)=>{
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId)
         }} onKeyDown={(e)=>{
            if (e.key === "Enter" || e.key===" ") {
               e.preventDefault();
               e.stopPropagation();
               closeTab(fileId) 
            }
      }}
      className={cn("p-0.5  rounded-sm transition-opacity hover:opacity-100 opacity-0 group-hover:opacity-100",isActive && "opacity-100" )}
      >
        <XIcon className='size-3.5'/>
         </button >
        </Button>
    )
}

const  Topnavigation = ({projectId}:{projectId:Id<"projects">}) => {
    const {openTabs} = useEditor(projectId);
    console.log("opentabs",openTabs);
  return (
    <ScrollArea className='flex-1'>
        <nav className='bg-sidebar flex items-center h-9 border-b'>
         {
            openTabs.map((fileId,index)=>(
                <Tab key={fileId} fileId={fileId} isFirst={index===0} projectId={projectId} />
            ))
         }
        </nav>
        <ScrollBar orientation='horizontal' />
    </ScrollArea>
  )
}

export default Topnavigation