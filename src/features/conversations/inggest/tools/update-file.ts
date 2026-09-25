import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface UpdateFilesToolOptions{
    internalKey:string;
}

const paramsSchema = z.object({
    fileId:z.string().min(1,"File Id can not be empty"),
    content:z.string()
})


export const createUpdateFileTool = ({internalKey}:UpdateFilesToolOptions)=>{

    return createTool({
        name:"Updatefiles",
        description:"update content of existing File",
        parameters:z.object({
            fileId:z.string().describe("The Id of the file to update"),
            content:z.string().describe("The new content for the file")
        }),
        handler: async (params,{step:toolstep})=>{

            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {fileId,content} = parsed.data
            const file =  await convex.query(api.system.getFileById,{internalKey,fileId:fileId as Id<"files">})
            if (!file) {
                return `error : file with Id ${fileId} not found . use listfile to get valid fileId`
            }
            if (file.type ==="folder") {
                return `error : ${fileId} is a folder not file . you can only update file contents`
            }
            try {
                return await toolstep?.run("update-files",async()=>{

                    await convex.mutation(api.system.updateFile,{internalKey,fileId:fileId as Id<"files">,content})

                    return `File ${file.name} updated sucessfully`
                })
            } catch (error) {
                return `Error reading files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}