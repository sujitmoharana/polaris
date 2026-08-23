import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constant";
import { DEFAULT_CONVERSATION_TITLE } from "../constant";
import { createAgent, openai } from '@inngest/agent-kit';

interface MessageEvent {
    messageId:Id<"messages">,
    conversationId:Id<"conversations">,
    projectId:Id<"projects">,
    message:string
}

export const processMessage = inngest.createFunction(
    {
      id: "process-message",
      triggers: {
        event: "message/sent",
      },
      cancelOn: [
        {
          event: "message/cancel",
          if: "event.data.messageId == async.data.messageId",
        },
      ],
      onFailure:async({event,step})=>{
        const {messageId} = event.data.event.data as MessageEvent
        const internalKey = process.env.CONVEX_INTERNAL_KEY;
        if (internalKey) {
           await step.run("update-message-on-Failure",async()=>{
            await convex.mutation(api.system.updateMessageContent, {
              messageId,
              internalKey,
              content: "my appolozies i encoyter an error",
            });
           })
        }
      }
    },
    async ({ event, step }) => {
      const { messageId,conversationId,message,projectId} = event.data as MessageEvent;
      console.log("messageId",messageId);
      const internalKey = process.env.CONVEX_INTERNAL_KEY;
  
      if (!internalKey) {
        throw new NonRetriableError(
          "CONVEX_INTERNAL_KEY is not configured"
        );
      }
  
      await step.sleep("wait-for-database-processing", "1s");

      //Get conversation for title generation check
      const conversation = await step.run("get-conversation",async()=>{
        return await convex.query(api.system.getConversationId,{
          internalKey,
          conversationId
        })
      })

      if (!conversation) {
        throw new NonRetriableError("Conversation not found")
      }

      //fetch recent messages for conversation context

      const recentmessages = await step.run("get-recent-message",async()=>{
        return await convex.query(api.system.getRecentMessage,{
          internalKey,
          conversationId,
          limit:10
        })
      })

      let systemprompt = CODING_AGENT_SYSTEM_PROMPT;

      //filter out the current processing messages and empty message
      const contextMessages = recentmessages.filter((msg)=>msg._id !== messageId && msg.content.trim() !== "")

      if (contextMessages.length > 0) {
        const historyText = contextMessages.map((msg)=>`${msg.role.toUpperCase()}:${msg.content}`).join("/n/n")

        systemprompt += `\n\n## Previous conversation (for context only - do not repeat these resopnse); \n${historyText}\n\n## current
                          Request : \nResopond ONLY to user's new message below. Do not repeat or reference your previous response`;
      }

      //generate conversation title if it's still the default

      const shouldGenerateTitle = conversation.title === DEFAULT_CONVERSATION_TITLE;
      if (shouldGenerateTitle) {
        const titleAgent = createAgent({
          name: 'Database administrator',
          system:TITLE_GENERATOR_SYSTEM_PROMPT,
          model: openai({
            model: 'gpt-4o-mini'
          }),
        });


        const {output} = await titleAgent.run(message,{step})

        const textMessage = output.find((m)=>m.type === "text" && m.role ==="assistant")

        if (textMessage?.type === "text") {
          const title = typeof textMessage.content === "string" ? textMessage.content.trim() : textMessage.content.map((c)=>c.text).join("").trim()

          if (title) {
            await step.run("update-conversation-titile",async()=>{
              await convex.mutation(api.system.updateConversationTitle,{
                internalKey,
                conversationId,
                title
              })
            })
          }
        }
      }

      await step.run("update-assistant-message", async () => {
        await convex.mutation(api.system.updateMessageContent, {
          messageId,
          internalKey,
          content: "AI processed this message",
        });
      });
    }
  );