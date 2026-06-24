import { ChevronRightIcon, } from "lucide-react"
import { useState } from "react"
import {FileIcon,FolderIcon} from "@react-symbols/icons/utils"
import { Input } from "@/components/ui/input";
import { getItemPadding } from "./constant";

const CreateInput = ({level,onCancel,onSubmit,type}:{type:"file"|"folder"|null,level:number,onSubmit:(name:string)=>void,onCancel:()=>void}) => {
    const [value,setValue] = useState("");
    const hanleSubmit = ()=>{
        const trimmedvalue = value.trim();
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
         <Input onBlur={hanleSubmit} autoFocus type="text" value={value} onChange={(e)=>setValue(e.target.value)} className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
           onKeyDown={(e)=>{
            if (e.key ==="Enter") {
                hanleSubmit()
            }
            if (e.key==="Escape") {
                onCancel()
            }
           }}
         />
    </div>
  )
}

export default CreateInput