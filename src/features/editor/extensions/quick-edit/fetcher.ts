import ky from "ky";
import { toast } from "sonner";
import z from "zod";



const editRequestSchema = z.object({
    selectedCode:z.string(),
    fullcode:z.string(),
    instruction:z.string()
})
const editResponseSchema = z.object({
   editcode:z.string()
})

type EditRequest = z.infer<typeof editRequestSchema>
type EditResponse = z.infer<typeof editResponseSchema>


export const fetcher = async(payload:EditRequest,signal:AbortSignal):Promise<string|null> =>{
    try {
        const validatedPayload = editRequestSchema.parse(payload);

        const response = await ky.post("/api/quick-edit",{
            json:validatedPayload,
            signal:signal,
            timeout:30_000,
            retry:0
        }
        ).json<EditResponse>()
       
        const validatedResponse = editResponseSchema.parse(response)
        console.log("RESPONSE",response);
        return validatedResponse.editcode || null
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return null
        }
    }
    toast.error("failed to fetch ai quckedit")
    return null
}