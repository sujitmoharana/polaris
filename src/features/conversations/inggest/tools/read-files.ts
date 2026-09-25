import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import {z} from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";


interface ReadFilesToolOptions{
    internalKey:string;
}

const paramsSchema = z.object({
    fileIds:z.array(z.string().min(1,"File Id can not be empty")).min(1,"provide at least one file Id")
})

export const createReadFilesTool = ({internalKey}:ReadFilesToolOptions)=>{

    return createTool({
        name:"readFiles",
        description:"Read the content of files form the project , return file contents",
        parameters:z.object({
            fileIds:z.array(z.string()).describe("Array of file IDs to read")
        }),
        handler: async (params,{step:toolstep})=>{
            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error ${parsed.error.issues[0].message}`
            }

            const {fileIds} = parsed.data

            try {
                return await toolstep?.run("read-files",async()=>{
                    const results:{id:string;name:string;content:string}[] = [];

                    for(const fileId of fileIds){
                        const file =  await convex.query(api.system.getFileById,{internalKey,fileId:fileId as Id<"files">})
                        if (file && file.content) {
                            results.push({
                                id:file._id,
                                name:file.name,
                                content:file.content
                            })
                        }
                    }

                    if (results.length === 0) {
                        return `Error :no files found with provided Ids.Use listfiles to get valid fileIds`
                    }

                    return JSON.stringify(results)
                })
            } catch (error) {
                return `Error reading files :${error instanceof Error ? error.message : "unknown error"} `
            }
        }

    })

}