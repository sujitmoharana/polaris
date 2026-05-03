import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertCircleIcon,GlobeIcon,Loader2Icon, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { useproject } from "./hooks/use-projects";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

interface ProjectCommandDialogProps{
    open:boolean;
    onOpenChange:(open:boolean) =>void
}

const getProjecticon =(projects:Doc<"projects">)=>{
    if(projects.importStatus === "completed"){
        return <FaGithub className="size-3.5 text-muted-foreground"/>
    }
    if(projects.importStatus === "failed"){
        return <AlertCircleIcon className="size-3.5 text-muted-foreground"/>
    }
    if(projects.importStatus === "importing"){
        return <LoaderCircle className="size-3.5 text-muted-foreground animate-spin"/>
    }
    return <GlobeIcon className="size-3.5 text-muted-foreground"/>
  }

export const ProjectsCommandDialog = ({open,onOpenChange}:ProjectCommandDialogProps)=>{
     const router = useRouter();
     const project = useproject()

     const handleSelect = (projectId:string)=>{
               router.push(`/projects/${projectId}`);
               onOpenChange(false)
     }
     return(
        <CommandDialog open={open} onOpenChange={onOpenChange} title="Search Project" description="Search and navigate to your projects">
            <CommandInput placeholder="search Projects..."/>
             <CommandList>
                <CommandEmpty>No project found.</CommandEmpty>
                <CommandGroup heading="projects">
                   {project?.map((project)=>(
                    <CommandItem key={project._id} value={`${project.name}-${project._id}`} onSelect={()=>handleSelect(project._id)}>
                       {getProjecticon(project)}
                       <span>{project.name}</span>
                    </CommandItem>
                   ))}
                </CommandGroup>
             </CommandList>
        </CommandDialog>
     )
}

