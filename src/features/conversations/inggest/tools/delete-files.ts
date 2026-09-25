import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface DeleteFileToolOptions{
    internalKey:string;
}

const paramsSchema = z.object({
    fileIds:z.string().min(1,"File Id is required"),
})


export const createDeleteFileTool = ({internalKey}:DeleteFileToolOptions)=>{

    return createTool({
        name:"deletefiles",
        description:"delete files or folders from the project .if deleting a folder , all content will be deleted recursivly ",
        parameters:z.object({
            fileIds:z.string().describe("Array of file or folder IDs to delete"),
        }),
        handler: async (params,{step:toolstep})=>{

            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {fileIds} = parsed.data

            //validate all files exist  before running the step
           const filesToDelete:{id:string;name:string,type:string}[] = [];

           for(const fileId of fileIds){
            const file =  await convex.query(api.system.getFileById,{internalKey,fileId:fileId as Id<"files">})

            if (!file) {
                return `error : file with Id ${fileId} not found . use listfile to get valid fileId`
            }

            filesToDelete.push({
                id:file._id,
                name:file.name,
                type:file.type
            })
           }

            try {
                return await toolstep?.run("delete-files",async()=>{

                    const results:string[] =[];

                    for(const file of filesToDelete){
                        await convex.mutation(api.system.deleteFile,{internalKey,fileId:file.id as Id<"files">})
                        
                        results.push(`deleted ${file.type} "${file.name} sucessfully"`);
                    }

                    return results.join("\n")
                })
            } catch (error) {
                return `Error deletting
                 files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}