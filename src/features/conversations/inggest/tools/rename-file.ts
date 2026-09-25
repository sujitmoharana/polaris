import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface RenameFileToolOptions{
    internalKey:string;
}

const paramsSchema = z.object({
    fileId:z.string().min(1,"File Id is required"),
    newName:z.string().min(1,"New name is required")
})


export const createRenameFileTool = ({internalKey}:RenameFileToolOptions)=>{

    return createTool({
        name:"renameFile",
        description:"Rename file or folder",
        parameters:z.object({
            fileId:z.string().describe("The Id of the file or folder to rename"),
            newName:z.string().describe("The new name for the file or foldeer")
        }),
        handler: async (params,{step:toolstep})=>{

            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {fileId,newName} = parsed.data

            const file =  await convex.query(api.system.getFileById,{internalKey,fileId:fileId as Id<"files">})
            if (!file) {
                return `error : file with Id ${fileId} not found . use listfile to get valid fileId`
            }
           
            try {
                return await toolstep?.run("rename-files",async()=>{

                    await convex.mutation(api.system.rename,{internalKey,fileId:fileId as Id<"files">,newName})

                    return `renamed ${file.name} to ${newName} sucessfully`
                })
            } catch (error) {
                return `Error renaming files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}