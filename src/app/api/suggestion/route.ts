import {generateText,Output} from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"
import {z} from "zod"
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { auth } from "@clerk/nextjs/server";

const suggestionSchema = z.object({
    suggestion:z.string().describe("The code to insert at cursor, or empty string if no completion needed")
})
const client = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are an expert code completion assistant.

Your task is to generate ONLY the code that should be inserted immediately after the cursor.

Rules:
- Never repeat code that already exists.
- Never explain your answer.
- Never wrap the response in markdown.
- Return ONLY the code to insert.
- If no completion is needed, return an empty string.

Follow this order:

1. Check next_lines.
   - If next_lines already continues the code correctly, return an empty string.

2. Check before_cursor.
   - If it ends with a complete statement (;, }, )), return an empty string.

3. Otherwise, generate only the missing code that should be inserted after the cursor.
`;

const USER_PROMPT = `
File Name:
{fileName}

Current Line Number:
{lineNumber}

Previous Lines:
{PreviousLines}

Current Line:
{currentLine}

Before Cursor:
{textBeforeCursor}

After Cursor:
{textAfterCursor}

Next Lines:
{nextLines}

Full Code:
{code}
`;

export async function POST(request:Request){
    try {

        const {userId}= await auth()
  
        if (!userId) {
            return NextResponse.json({error:"Unauthorized"},{status:400})

        }

        const {fileName,code,currentLine,PreviousLines,textBeforeCursor,textAfterCursor,nextLines,lineNumber} = await request.json();
        if (!code) {
            return NextResponse.json({error:"code is required"},{status:400})
        }

        const prompt = USER_PROMPT.replace("{fileName}",fileName).replace("{code}",code).replace("{currentLine}",currentLine).replace("{PreviousLines}",PreviousLines || "").replace("{textBeforeCursor}",textBeforeCursor).replace("{textAfterCursor}",textAfterCursor).replace("{nextLines}",nextLines||"").replace("{lineNumber}",lineNumber.toString())
      console.log("prompt",prompt);
        const result = await  client.responses.parse({
            model:"gpt-4o",
            input: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            text:{
                format: zodTextFormat(suggestionSchema, "event"),
              }
            
        })  
       console.log("result-respose",result.output_parsed?.suggestion);
       
        return NextResponse.json({suggestion:result.output_parsed?.suggestion},{status:200})

    } catch (error) {
        return NextResponse.json({error:"failed to generate suggestion"},{status:400})
    }
}