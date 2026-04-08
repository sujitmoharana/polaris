"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import * as Sentry from "@sentry/nextjs";
import { useAuth } from "@clerk/nextjs";
const page = () => {
 
  const {userId} = useAuth()
    const [loading,setLoading] = useState(false);
    const [loading2,setLoading2] = useState(false)

   const handleBlocking = async()=>{
    setLoading(true)
    await fetch("/api/demo/blocking",{method:"POST"})
    setLoading(false)
   }
   const handlebackground = async()=>{
    setLoading2(true)
    await fetch("/api/demo/unblocking",{method:"POST"})
    setLoading2(false)
   }


   const handleClientError = ()=>{
    Sentry.logger.info("user attempting to click client function",{userId})
    throw new Error("client error: Something went wrong in the browser!")
   } 

   const handleApiError = async()=>{
    await fetch("/api/demo/error",{method:"POST"})
   }
   const handleInngestError = async()=>{
    await fetch("/api/demo/inngest-error",{method:"POST"})
   }
    

  return (
    <div className="p-8 space-x-4">
       <Button disabled={loading} onClick={handleBlocking}>
        {loading?"Loading...":"Blocking"}
       </Button>
       <Button disabled={loading2} onClick={handlebackground}>
        {loading2?"Loading...":"Blocking"}
       </Button>
       <Button variant="destructive" onClick={handleClientError}>
         Client Error
       </Button>
       <Button variant="destructive" onClick={handleApiError}>
         Api Error
       </Button>
       <Button variant="destructive" onClick={handleInngestError}>
         inngest Error
       </Button>
    </div>
  )

}

export default page