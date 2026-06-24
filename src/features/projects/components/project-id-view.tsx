"use client"

import { cn } from "@/lib/utils"
import { Id } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaGithub } from "react-icons/fa"
import { Allotment } from "allotment"
import "allotment/dist/style.css";
import FileExplorer from "./file-explorer"
import { useproject } from "./hooks/use-projects"

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 350;
const DEFAULT_MAIN_SIZE = 1000;



const Tab =({isActive,label,onClick}:{label:string,isActive:boolean,onClick:()=>void})=>{
   return(
    <Button variant="ghost" onClick={onClick} className={cn(isActive && "bg-background  rounded-none text-foreground ","flex items-center rounded-none gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r ")}>
        <span className="text-sm ">{label} </span>
    </Button>
   )
}

const ProjectIdView = ({projectId}:{projectId:Id<"projects">}) => {
  const [activeView,setActiveView] = useState<"editor"|"preview">("editor");
  const project = useproject(projectId)
  return (
    <div className="flex flex-col h-screen w-full ">
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
        <div className={cn("flex-1 flex overflow-hidden",activeView === "editor" ? "block" : "hidden")}>
         <Allotment className="flex-1"  defaultSizes={[DEFAULT_SIDEBAR_WIDTH,DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane minSize={MIN_SIDEBAR_WIDTH} maxSize={MAX_SIDEBAR_WIDTH} preferredSize={DEFAULT_SIDEBAR_WIDTH} snap>
                   <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane >
                   <p>Editor view</p>
            </Allotment.Pane>
         </Allotment>
        </div>
    

        <div className={cn(activeView === "preview" ? "block" : "hidden")}>
          <div>Preview</div>
        </div>
    </div>
  )
}

export default ProjectIdView