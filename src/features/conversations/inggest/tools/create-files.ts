import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Pi } from "lucide-react";


interface CreateFilesToolOptions{
    internalKey:string
    projectId:Id<"projects">
}

const paramsSchema = z.object({
  parentId:z.string(),
  files:z.array(z.object({
    name:z.string(),
    content:z.string(),
  })).min(1,"At least one file is required"),
})


export const createFileTool = ({internalKey,projectId}:CreateFilesToolOptions)=>{

    return createTool({
        name:"Createfiles",
        description:"create mutiple file at once iin the same folder .use this to batch create files that share the same parent folder . more efficient than creating them one by one",
        parameters:z.object({
           parentId:z.string().describe("The Id of the parent folder . use empty string for the root level, must ve valid folder Id from listfiles"),
           files:z.array(z.object({
            name:z.string().describe("the file name including extension"),
            content:z.string().describe("The file content")
           })).describe("Array of files to create")
        }),
        handler: async (params,{step:toolstep})=>{

            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {parentId,files} = parsed.data
          
            try {
               return await toolstep?.run("create-files",async()=>{
                let resolveParentId:Id<"files"> | undefined;

                if (parentId && parentId !== "") {
                    try {
                        resolveParentId = parentId as Id<"files">;
                        const parentFolder = await convex.query(api.system.getFileById,{internalKey,fileId:resolveParentId})
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
                const results = await convex.mutation(api.system.createFiles,{internalKey,parentId:resolveParentId,files,projectId,})
                
                const created = results.filter((r)=> !r.error)
                const failed = results.filter((r)=> r.error)

                let response = `Created ${created.length} files`
                if (created.length > 0) {
                 response += `\nCreated files: ${created.map((f)=>f.name).join(", ")}`                    
                }
                if (failed.length > 0) {
                    response += `.falied :${failed.map((r)=> `${r.name} (${r.error})`).join(", ")}`
                }
                return response;
            })
            } catch (error) {
                return `Error creating files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}