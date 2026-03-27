import { generateText } from "ai";
import { inngest } from "./client";
import { google } from "@ai-sdk/google";
import { url } from "inspector";
import { firecrawl } from "@/lib/firecrawl";

const URL_REGEX = /https?:\/\/[^\s]+/g; 

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate", triggers: [{ event: "demo/generate" }] },
  async ({ event, step }) => {

    const {prompt} = event.data as {prompt:string}
    const urls = await step.run("exctract-urls",async()=>{
        return prompt.match(URL_REGEX)??[];
    }) as string[];

    const scrapedContent = await step.run("scarpe-urls",async()=>{
      const results = await Promise.all(
        urls.map(async(url)=>{
          const result = await firecrawl.scrape(
            url,{formats:["markdown"]}
          )
          return result.markdown ?? null;
        })
      )
      return results.filter(Boolean).join("\n\n");
      
    })

    
    const finalprompt = scrapedContent ? `Context:\n${scrapedContent}\n\nQuestion:${prompt}`:prompt;
    console.log("prompt",prompt,"scrapcontext", scrapedContent,"finalprompt",finalprompt);

    await step.run("generate-text", async()=>{
      console.log("prompt",prompt,"scrapcontext", scrapedContent);
        return await generateText({
          model: google('gemini-2.5-flash'),
          prompt: finalprompt,
        });  
    });
  },
);
