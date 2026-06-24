import { cn } from "@/lib/utils"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { ChevronRightIcon, FolderKanban } from "lucide-react"
import { useCreateFile, useCreateFolder, useFolderContains,useDeleteFile,useRenameFile } from "../hooks/use-files"
import { getItemPadding } from "./constant"
import LoadingRow from "./loading-row"
import CreateInput from "./create-input"
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { useState } from "react"
import TreeItemWrapper from "./tree-item-wrapper"
import RenameInput from "./renaming-input"

const Tree = ({item,level=0,projectId}:{item:Doc<"files">,level?:number,projectId:Id<"projects">}) => {
    console.log("items",item,"level",level,"projectId",projectId);
    
    const [isOpen,setIsOpen] = useState(false);
    const [isRenaming,setIsRenaming]=useState(false);
    const [creating,setCreating]=useState<"file"|"folder"|null>(null);

    const renameFile = useRenameFile()
    const deleteFile = useDeleteFile()
    const createFile = useCreateFile()
    const createFolder = useCreateFolder()
    const folderContents = useFolderContains({
        projectId:projectId,
        parentId:item._id,
        enabled:item.type === "folder" && isOpen
    })
   
    const handleReaname = (newName:string)=>
    {
        setIsRenaming(false)
        if (newName === item.name) {
            return;
        }
        renameFile({id:item._id,newName:newName})
    }

    const startCreating = (type:"file"|"folder")=>{
        console.log("folderpinku",item);
        setIsOpen(true);
        setCreating(type)
    }
    const handleCreate = (name:string)=>{
    setCreating(null);
    
    if (creating ==="file") {
        createFile({projectId:projectId,name:name,content:"",parentId:item._id})
    }else{
        createFolder({projectId:projectId,name:name,parentId:item._id})
    }

}

    if(item.type ==="file")
    {

        const fileName = item.name;
        
      if (isRenaming) {
        return(
            <RenameInput defaultValue={item.name} type="file" level={level} onSubmit={handleReaname} onCancel={()=>setIsRenaming(false)}/>
        )
      }

        return(
            <TreeItemWrapper item={item} level={level} isActive={false} onClick={()=>{console.log("itemfil",item);
            }} onDoubleClick={()=>{}} onRename={()=>setIsRenaming(true)} onDelete={()=>{
                //close Tab
                deleteFile({id:item._id})
            }}>
                <FileIcon fileName={fileName} autoAssign className="size-4"/>
                <span className="truncate text-sm">{fileName}</span>
            </TreeItemWrapper>
        )
    }

    const folderName = item.name;
    console.log("folderRender",folderName);
    
    const folderRender = (
        <>
        <div className="flex items-center gap-0.5">
            <ChevronRightIcon className={cn("size-4 shrink-0 text-muted-foreground",isOpen && "rotate-90")}/>
            <FolderIcon folderName={folderName} className="size-4"/>
        </div>
        <span className="truncate text-sm">{folderName}</span>
        </>
    )

    if (creating) {
        return(
            <>
                <button onClick={()=>setIsOpen((value)=>!value)} className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full" style={{paddingLeft:getItemPadding(level,false)}}>
                    {folderRender}
                </button>
                {isOpen && (
                    <>
                    {folderContents === undefined && <LoadingRow level={level+1}/>}
                            <CreateInput type={creating} level={level+1} onSubmit={handleCreate} onCancel={()=>setCreating(null)}/> 
                                {
                            folderContents?.map((subItem)=>(
                                <Tree item={subItem} projectId={projectId} key={subItem._id} level={level+1}/>
                            ))
                        }
                    </>
                )}
            </>
        )
    }
    if (isRenaming) {
        return(
            <>
                <RenameInput type="folder" defaultValue={folderName} isOpen={isOpen} level={level} onSubmit={handleReaname} onCancel={()=>setIsRenaming(false)} />
                {isOpen && (
                    <>
                    {folderContents === undefined && <LoadingRow level={level+1}/>}                                {
                            folderContents?.map((subItem)=>(
                                <Tree item={subItem} projectId={projectId} key={subItem._id} level={level+1}/>
                            ))
                        }
                    </>
                )}
            </>
        )
    }

  return (
    <>
    
    <TreeItemWrapper item={item} level={level}  isActive={false} onClick={()=>{
        console.log("foldersujit",item);
        setIsOpen((value)=>!value)}
    } 
        onDoubleClick={()=>{}} onRename={()=>setIsRenaming(true)} onDelete={()=>{
        //close Tab
        deleteFile({id:item._id})
    }}
    onCreateFile={()=>{
        console.log("file",item);
        startCreating("file")}}
    onCreateFolder={()=>{
        console.log("folder",item);
        startCreating("folder")}}
    >
        {folderRender}
    </TreeItemWrapper>
    {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level+1}  />}
         
         {folderContents?.map((subItem)=>(
            <Tree item={subItem} key={subItem._id} projectId={projectId} level={level+1}/>
         ))}

          </>
    )}
    </>
  )
}

export default Tree