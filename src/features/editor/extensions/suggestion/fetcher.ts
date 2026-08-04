import ky from "ky"
import { toast } from "sonner"
import {z} from "zod"

const suggestionRequestSchema = z.object({
    fileName:z.string(),
    code:z.string(),
    currentLine:z.string(),
    PreviousLines:z.string(),
    textBeforeCursor:z.string(),
    textAfterCursor:z.string(),
    nextLines:z.string(),
    lineNumber:z.number()
})

const SuggestionResponseSchema = z.object({
    suggestion:z.string()
})

type SuggestionRequest = z.infer<typeof suggestionRequestSchema>
type SuggestionResponse = z.infer<typeof SuggestionResponseSchema>

export const fetcher = async(payload:SuggestionRequest,signal:AbortSignal):Promise<string|null> =>{
    try {
        const validatedPayload = suggestionRequestSchema.parse(payload);

        const response = await ky.post("/api/suggestion",{
            json:validatedPayload,
            signal:signal,
            timeout:10_000,
            retry:0
        }
        ).json<SuggestionRequest>()
       
        const validatedResponse = SuggestionResponseSchema.parse(response)
        console.log("RESPONSE",response);
        return validatedResponse.suggestion
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            return null
        }
    }
    toast.error("failed to fetch ai completions")
    return null
}