import { firecrawl } from "@/lib/firecrawl";
import { createTool } from "@inngest/agent-kit";
import { parse } from "path";
import {z} from "zod";

const paramsSchema = z.object({
   urls:z.array(z.url("Inalid URL format")).min(1,"Proide at least one URL to scarpe")
  })


  export const createScrapeUrlsTool = () =>{
    return createTool({
        name:"scrapeUrls",
        description:"Scrape content from URLs to get documentation or reference meterial.Use this when the user provides URLs or reference external documentation. returns markdown conetnt from the scatrped pages",
        parameters:z.object({
            urls:z.array(z.string()).describe("Array of URLS to scrape for content")
        }),
        handler:async(params,{step:toolstep})=>{
            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error : ${parsed.error.issues[0].message}`
            }

            const {urls} = parsed.data

            try {
                return await toolstep?.run("scrape-urls",async()=>{
                    const results:{url:string; content:string}[] = []

                    for(const url of urls){
                        try {
                            const result = await firecrawl.scrape(url,{
                                formats:["markdown"]
                            })

                            if (result.markdown) {
                                results.push({url,content:result.markdown})
                            }

                        } catch (error) {
                            results.push({
                                url,
                                content:`failed to scraep urls : ${url}`
                            })
                        }
                    }

                    if (results.length === 0) {
                        return `No content could be scarped from the proided URls`
                    }

                    return JSON.stringify(results)

                })
            } catch (error) {
                
            }
        }
    })
  }