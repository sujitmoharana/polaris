"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

const page = () => {

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

  return (
    <div className="p-8 space-x-4">
       <Button disabled={loading} onClick={handleBlocking}>
        {loading?"Loading...":"Blocking"}
       </Button>
       <Button disabled={loading2} onClick={handlebackground}>
        {loading2?"Loading...":"Blocking"}
       </Button>
    </div>
  )
}

export default page