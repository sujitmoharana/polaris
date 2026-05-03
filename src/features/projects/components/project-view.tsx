"use client"
import { Poppins } from 'next/font/google'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SparkleIcon } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'
import {FaGithub} from "react-icons/fa"
import { ProjectList } from './projects-list'
import { useCreateProject } from './hooks/use-projects'
import {adjectives,animals,colors,uniqueNamesGenerator} from "unique-names-generator"
import { ProjectsCommandDialog } from './project-command-dialog'
const font = Poppins({
    subsets:["latin"],
    weight:["400","500","600","700"]
})

const ProjectView = () => {
  const createProject = useCreateProject();
  const [commandDialogOpen,setcommandDialogOpen] = useState(false);

  useEffect(()=>{
    const handleKeyDown = (e:KeyboardEvent)=>{
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setcommandDialogOpen(true)
        }
      }
    }

    document.addEventListener("keydown",handleKeyDown)
    return ()=>document.removeEventListener("keydown",handleKeyDown)
  },[])
  return (
    <> 
    <ProjectsCommandDialog open={commandDialogOpen} onOpenChange={setcommandDialogOpen}/>  
    <div className='h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16'>
        <div className='w-full max-w-sm mx-auto flex flex-col gap-4 items-start '>
           <div className='flex justify-between gap-4 w-full items-center'>
               <div className='flex items-center gap-2 w-full '>
                <div className='flex gap-2'>
                <img src="/logo.svg" alt='polaris' className='size-7 md:size-6'/>
                  <span className='text-2xl font-bold'>polaris</span>
                </div>
               </div>
           </div>
           <div className='flex gap-4 '>                
            <Button variant="outline" onClick={()=>{
              const projectsName = uniqueNamesGenerator({
                dictionaries:[adjectives,animals,colors],
                separator:"_",
                length:3
              })
                 createProject({name:projectsName })
            }} 
            className='h-full w-full flex flex-col items-start justify-start p-4 bg-background border gap-6 rounded-none'>
                   <div className='flex items-center justify-between w-full'>
                   <SparkleIcon className='size-4'/>
                   <Kbd className='bg-accent border'>
                    Ctrl+j
                   </Kbd>
                   </div> 
                   <div className='text-sm'>
                    New
                   </div>
                </Button>
                <Button variant="outline" onClick={()=>{}} className='h-full w-full  flex flex-col items-start justify-start p-4 bg-background border gap-6 rounded-none'>
                   <div className='flex items-center justify-between w-full'>
                   <FaGithub className='size-4'/>
                   <Kbd className='bg-accent border'>
                    Ctrl+j
                   </Kbd>
                   </div>
                   <div className='text-sm'>
                    Import
                   </div>
                </Button>
            </div>
            <ProjectList onViewAll={()=>setcommandDialogOpen(true)} />
        </div>
    </div>
    </>
  )
}

export default ProjectView