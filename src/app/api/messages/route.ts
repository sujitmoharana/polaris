
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex-client";
import { inngest } from "@/inngest/client";


const requestSchema = z.object({
    conversationId:z.string(),
    message:z.string()
})

export async function POST(request:Request){
    const {userId} = await auth();

    if (!userId) {
        return NextResponse.json({error:"Unauthorized"},{status:401})
    }

    const body = await request.json();
    const {conversationId,message} = requestSchema.parse(body)

    //call convex utation query
    const conversation = await convex.query(api.system.getConversationId,{conversationId:conversationId as Id<"conversations">,internalKey:process.env.CONVEX_INTERNAL_KEY!})

    if (!conversation) {
        return NextResponse.json({eroor:"Conversation not found"},{status:401})
    }

    const projectId = conversation.projectId

    await convex.mutation(api.system.createMessage,{
        internalkey:process.env.CONVEX_INTERNAL_KEY!,
        conversationId:conversationId as Id<"conversations">,
        projectId:projectId,
        role:"user",
        content:message
    })


    const assistantMessageId = await convex.mutation(api.system.createMessage,{
        internalkey:process.env.CONVEX_INTERNAL_KEY!,
        conversationId:conversationId as Id<"conversations">,
        projectId:projectId,
        role:"assistant",
        content:"",
        status:"processing"
    })

    const event = await inngest.send({
        name:"message/sent",
        data:{
            messageId:assistantMessageId
        }
    })

    return NextResponse.json({
        success:true,
        eventId:event.ids[0],
        messageId:assistantMessageId
    })
}