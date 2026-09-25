import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface ReadFilesToolOptions{
    projectId:Id<"projects">
    internalKey:string;
}


export const createListFilesTool = ({internalKey,projectId}:ReadFilesToolOptions)=>{

    return createTool({
        name:"Listfiles",
        description:"List all files and folders in the project. return names,Ids, types,and parentid for each Item. Items with parentId :null are at root leel.use parentId to understand the folders structure -items with same parentId are in the same folder.",
        parameters:z.object({}),
        handler: async (_,{step:toolstep})=>{

            try {
                return await toolstep?.run("List-files",async()=>{
                   const files = await convex.query(api.system.getProjectFiles,{
                    internalKey,
                    projectId
                   })
 
                   
            const sorted =  files.sort((a,b)=>{
                //folder come before files
                if (a.type ==="folder" && b.type === "file") {
                    return -1;
                }
                if (a.type ==="file" && b.type === "folder") {
                    return 1;
                }
                //within same type , sort alphabetically by name
                return a.name.localeCompare(b.name)
            })

            const fileList = sorted.map((f)=>({
                id:f._id,
                name:f.name,
                type:f.type,
                parentId:f.parentId ?? null
            }))

            return JSON.stringify(fileList);
                })
            } catch (error) {
                return `Error reading files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}