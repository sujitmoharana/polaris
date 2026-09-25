import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface CreateFoldersToolOptions{
    internalKey:string
    projectId:Id<"projects">
}

const paramsSchema = z.object({
  parentId:z.string(),
  name:z.string().min(1,"folder name is required")
})


export const createFolderTool = ({internalKey,projectId}:CreateFoldersToolOptions)=>{

    return createTool({
        name:"Createfolder",
        description:"create a new folder in the project",
        parameters:z.object({
           parentId:z.string().describe("The Id of the parent folder from listfiles . use empty string for the root level, must be valid folder Id from listfiles"),
           name:z.string().describe("the  name of the folder to create"),

        }),
        handler: async (params,{step:toolstep})=>{

            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {parentId,name} = parsed.data
          
            try {
               return await toolstep?.run("create-folder",async()=>{
              
                if (parentId) {
                    try {
                        const parentFolder = await convex.query(api.system.getFileById,{internalKey,fileId:parentId as Id<"files">})
                        if (!parentFolder) {
                            return `error : parent folder with Id ${parentId} not found . use listfile to get valid folder`
                        }
                        if (parentFolder.type !== "folder") {
                            return `error : ${parentId} is a file . not a folder .use a folder ID as parentId`
                        }
                    } catch (error) {
                        return `ERROR : invalid parentId ${parentId} . use listfiles to get valid folder Id  or use empty string for root level`
                    }
                }
                const folderId = await convex.mutation(api.system.createFolder,{internalKey,parentId:parentId ? (parentId as Id<"files">) : undefined,name,projectId,})
                
               
                return `folder created with Id : ${folderId}`;
            })
            } catch (error) {
                return `Error creating folder :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}