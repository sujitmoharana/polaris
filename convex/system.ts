import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const validateinternalKey = (key:string)=>{
    const internalKey = process.env.CONVEX_INTERNAL_KEY
      if (!internalKey) {
        throw new Error("Convex_internal_key is not configured")
      }

      if (key !== internalKey) {
        throw new Error("Internal invalid key")
      }
}

export const getConversationId = query({
    args:{
        conversationId: v.id("conversations"),
        internalKey:v.string()
    },
    handler:async(ctx,args)=>{
        validateinternalKey(args.internalKey)
    return await ctx.db.get(args.conversationId)
    }
})

export const createMessage  = mutation({
    args:{
        internalkey:v.string(),
        conversationId:v.id("conversations"),
        projectId:v.id("projects"),
        role:v.union(v.literal("user"),v.literal("assistant")),
        content:v.string(),
        status:v.optional(
            v.union(
                v.literal("processing"),
                v.literal("completed"),
                v.literal("cancelled"),
            )
        )
    },
    handler:async(ctx,args)=>{
     validateinternalKey(args.internalkey)

     const messageId = await ctx.db.insert("messages",{
        conversationId:args.conversationId,
        projectId:args.projectId,
        content:args.content,
        role:args.role,
        status:args.status
     })

      //update conversation updatedAt
    await ctx.db.patch(args.conversationId,{
        updatedAt:Date.now()
    })

    return messageId
    }
})

export const updateMessageContent = mutation({
    args:{
        internalKey:v.string(),
        messageId:v.id("messages"),
        content:v.string()
    },
    handler:async(ctx,args)=>{
        validateinternalKey(args.internalKey)

        await ctx.db.patch("messages",args.messageId, {
             content:args.content,
             status:"completed" as const
        })
    }
})


export const getProcessingMessages = query({
    args:{
        internalKey : v.string(),
        projectId:v.id("projects")
    },
    handler:async(ctx,args)=>{
      validateinternalKey(args.internalKey)
      return  await ctx.db.query("messages").withIndex("by_project_status",(q)=>q.eq("projectId",args.projectId).eq("status","processing")).collect()
    }
})



export const updateMessageStatus = mutation({
    args:{
        internalKey:v.string(),
        messageId:v.id("messages"),
        status: v.union(
                v.literal("processing"),
                v.literal("completed"),
                v.literal("cancelled"),
            )
    },
    handler:async(ctx,args)=>{
        validateinternalKey(args.internalKey)

        await ctx.db.patch("messages",args.messageId, {
             status:args.status 
        })
    }
})
