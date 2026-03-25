import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import {google} from "@ai-sdk/google"
import { inngest } from '@/inngest/client';

export async function POST(){
   await inngest.send({
    name:"demo/generate",
    data:{}
   })

   return NextResponse.json({status:"started"})
} 