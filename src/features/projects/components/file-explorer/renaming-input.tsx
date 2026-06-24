import { ChevronRightIcon, } from "lucide-react"
import { useState } from "react"
import {FileIcon,FolderIcon} from "@react-symbols/icons/utils"
import { Input } from "@/components/ui/input";
import { getItemPadding } from "./constant";

const RenameInput = ({level,onCancel,defaultValue,isOpen,onSubmit,type}:{type:"file"|"folder"|null,level:number,onSubmit:(name:string)=>void,onCancel:()=>void,defaultValue:string,isOpen?:boolean}) => {
    const [value,setValue] = useState(defaultValue);
    const hanleSubmit = ()=>{
        const trimmedvalue = value.trim() ;
        if(trimmedvalue){
             onSubmit(trimmedvalue)
        }else{
            onCancel();
        }
    }
  return (
    <div className="w-full flex items-center gap-1 h-5.5 bg-accent/30" style={{paddingLeft:getItemPadding(level=level,type==="file")}}>
         <div className="flex items-center gap-0.5">
            {type==="folder" &&(
                <ChevronRightIcon className="size-4 shirnk-0 text-muted-foreground"/>
            )}
            {type==="file" &&(
                <FileIcon fileName={value} className="size-4 shirnk-0 text-muted-foreground"/>
            )}
            {type==="folder" &&(
                <FolderIcon folderName={value} className="size-4 shirnk-0 text-muted-foreground"/>
            )}
         </div>
         <Input autoFocus type="text" value={value} onChange={(e)=>setValue(e.target.value)} className="flex-1 text-sm bg-transparent text-white border-black focus:bg-zinc-800 focus:border-black focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-black"
  
           onKeyDown={(e)=>{
            if (e.key ==="Enter") {
                hanleSubmit()
            }
            if (e.key==="Escape") {
                onCancel()
            }
           }}
           onBlur={ hanleSubmit}
            onFocus={(e)=>{
               if (type === "folder") {
                 e.currentTarget.select()
               }else{
                const value = e.currentTarget.value;
                const lastDotIndex = value.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    e.currentTarget.setSelectionRange(0,lastDotIndex)
                }else{
                    e.currentTarget.select()
                }
               }
            }}
         />
    </div>
  )
}

export default RenameInput