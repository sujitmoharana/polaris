"use client"

import { cn } from "@/lib/utils"
import { Id } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaGithub } from "react-icons/fa"

const Tab =({isActive,label,onClick}:{label:string,isActive:boolean,onClick:()=>void})=>{
   return(
    <Button variant="ghost" onClick={onClick} className={cn(isActive && "bg-background  rounded-none text-foreground ","flex items-center rounded-none gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r ")}>
        <span className="text-sm ">{label} </span>
    </Button>
   )
}

const ProjectIdView = ({projectId}:{projectId:Id<"projects">}) => {
  const [activeView,setActiveView] = useState<"editor"|"preview">("editor");
  return (
    <div className="h-8   flex flex-col ">
       <nav className="h-8  flex items-center bg-sidebar border-b ">
         <Tab label="code" isActive={activeView==="editor"} onClick={()=>{setActiveView("editor")}} />
         <Tab label="preview" isActive={activeView==="preview"} onClick={()=>{setActiveView("preview")}}/>
          <div className="ml-auto h-full ">
                <Button variant="ghost" className="flex items-center rounded-none gap-2 h-full px-3 cursor-pointer text-muted-foreground border-l">
                <FaGithub/>
                <span>Export</span>
                </Button>
          </div>
       </nav>
       <div className={cn(activeView === "editor" ? "block" : "hidden")}>
          <div>Editor</div>
        </div>

        <div className={cn(activeView === "preview" ? "block" : "hidden")}>
          <div>Preview</div>
        </div>
    </div>
  )
}

export default ProjectIdView