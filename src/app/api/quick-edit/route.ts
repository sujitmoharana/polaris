import {generateText,Output} from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"
import {z} from "zod"
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { auth } from "@clerk/nextjs/server";
import { firecrawl } from "@/lib/firecrawl";

const suggestionSchema = z.object({
    editCode:z.string().describe("The edited version of the selected code based on the instruction")
})


const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g


const client = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are a code editing assistant.

Edit the selected code based on the user's instruction.

Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless explicitly requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
`;

const USER_PROMPT = `
<context>

<selected_code>
{selectedCode}
</selected_code>

<full_code_context>
{fullCode}
</full_code_context>

</context>

{documentation}

<instruction>
{instruction}
</instruction>
`;

export async function POST(request:Request){
    try {

        const {userId}= await auth()
  
        if (!userId) {
            return NextResponse.json({error:"Unauthorized"},{status:400})

        }

        const {selectedCode,fullCode,instruction} = await request.json();
        console.log("selectcode",selectedCode,"fullcode",fullCode,"instruction",instruction);
        
        if (!selectedCode) {
            return NextResponse.json({error:"code is required"},{status:400})
        }
        if (!instruction) {
            return NextResponse.json({error:"code is required"},{status:400})
        }

        const urls:string[] = instruction.match(URL_REGEX) || [];
        console.log("url",urls);
        let documentationContext ="";

        if (urls.length > 0 ) {
            const scrapedResult = await Promise.all(
                urls.map(async(url)=>{
                  try {
                    const result = await firecrawl.scrape(url,{
                        formats:["markdown"]
                    })
                    console.log("result-markdown",result.markdown);
                    if (result.markdown) {
                        return `<doc url="${url}">\n${result.markdown}\n</doc>`
                    }
                    return null;
                  } catch (error) {
                    return null
                  }
                })
            )
          console.log("scarpreesylt",scrapedResult);
            const validResults = scrapedResult.filter(Boolean)
             console.log("validresult",validResults);
            if (validResults.length > 0) {
              documentationContext = `<documentation>\n${validResults.join("\n\n")}\n</documentation>`  
            }
        }

     console.log("documentaioncontext",documentationContext);
     

        const prompt = USER_PROMPT.replace("{selectedCode}",selectedCode).replace("{fullCode}",fullCode||"").replace("{instruction}",instruction).replace("{documentation}",documentationContext)
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
       console.log("result-respose",result.output_parsed?.editCode);
       
        return NextResponse.json({editcode:result.output_parsed?.editCode},{status:200})

    } catch (error) {
        return NextResponse.json({error:"failed to generate edit"},{status:500})
    }
}