"use client"
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronsRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Id } from '../../../../../convex/_generated/dataModel'
import { useproject } from '../hooks/use-projects'
import { Button } from '@/components/ui/button'
import { useCreateFile, useCreateFolder, useFolderContains } from '../hooks/use-files'
import CreateInput from './create-input'
import LoadingRow from './loading-row'
import Tree from './tree'

const FileExplorer = ({projectId}:{projectId:Id<"projects">}) => {
    const [isOpen,setIsOpen]  = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [collapseKey,setCollapseKey] = useState(0);
    const [creating,setCreating] = useState<"file"|"folder"|null>(null)
    const project = useproject(projectId);
    const createFile = useCreateFile()
    const createFolder = useCreateFolder()
    const rootFiles = useFolderContains({projectId,enabled:isOpen})
    const handleCreate = (name:string)=>{
       setCreating(null)
       console.log("creating",creating);
       if (creating ==="file") {
        createFile({projectId:projectId,name:name,content:"",parentId:undefined
        })
       }else{
        createFolder({projectId:projectId,name:name,parentId:undefined})
       }
    }
  return (
    <div className='h-full bg-sidebar'>
       <ScrollArea>
<div
  role="button"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onClick={() => setIsOpen((value) => !value)}
  className="cursor-pointer w-full flex items-center gap-1 h-7 px-1 bg-accent"
>
  <ChevronRight
    className={cn(
      "size-4 shrink-0 text-muted-foreground ",
      isOpen && "rotate-90"
    )}
  />

  <p className="text-xs uppercase line-clamp-1">
    {project?.name ?? "Loading..."}
  </p>

  {isHovered && (
    <div className='ml-auto shrink-0'>
    <Button
      variant="ghost"
      size="icon-xs"
      className="ml-auto text-muted-foreground  "
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(true);
        //set creating "folder" to true
        setCreating("file")
      }}
    >
      <FilePlusCornerIcon className="size-3.5" />
    </Button>
    <Button
      variant="ghost"
      size="icon-xs"
      className="ml-auto text-muted-foreground  "
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(true)
        setCreating("folder")
      }}
    >
      <FolderPlusIcon className="size-3.5" />
    </Button>
    <Button
      variant="ghost"
      size="icon-xs"
      className="ml-auto text-muted-foreground  "
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setCollapseKey((prev)=>prev+1)
      }}
    >
      <CopyMinusIcon className="size-3.5" />
    </Button>
   
    </div>
  )}
</div>
{isOpen && (
  <>
    {rootFiles === undefined && <LoadingRow level={0}/>}
    {creating && (
            <CreateInput type={creating} level={0} onSubmit={handleCreate} onCancel={()=>setCreating(null)}/>
    )}
    {rootFiles?.map((item)=>(
      <Tree key={`${item._id}-${collapseKey}` } item={item} level={0} projectId={projectId}/>
    ))}
  </>
)}
       </ScrollArea>
    </div>
  )
}

export default FileExplorer