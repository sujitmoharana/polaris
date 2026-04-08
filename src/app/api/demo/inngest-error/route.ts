import { NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

export async function POST(){
   console.log("error on background jobs");
   
   await inngest.send({
    name:"demo/error",
    data:{}
   })

   return NextResponse.json({status:"started"})
} 