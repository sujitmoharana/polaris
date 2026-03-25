import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import {google} from "@ai-sdk/google"

export async function POST(){
    const response = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
      });  

      return NextResponse.json({response})
}