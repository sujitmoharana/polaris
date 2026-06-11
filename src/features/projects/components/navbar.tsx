"use client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Id } from '../../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'
import { useproject, useRenameProject } from './hooks/use-projects'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CloudCheckIcon, LoaderIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
const Navbar = ({projectId}:{projectId:Id<"projects">}) => {
  const project = useproject(projectId);
  const renameProject = useRenameProject(projectId)
  console.log("rename project3",renameProject);
  const [isRenameing,setIsRenaming]=useState(false);
  const [name,setName]=useState("");

  const handleStartRename = ()=>{
    if (!project) return;
    setName(project.name);
    setIsRenaming(true)
  }

  const handleSubmit = ()=>{
    if (!project) return;
    setIsRenaming(false);
    const trimmedname = name.trim();
    
    if (!trimmedname || trimmedname === project.name) return;
  console.log("rename project",renameProject({id:projectId,name:trimmedname}));

    renameProject({id:projectId,name:trimmedname})
  }

  const handleKeyDown = (e:React.KeyboardEvent)=>{
    if (e.key === "Enter") {
      handleSubmit()
    }else if(e.key === "Escape")
    {
      setIsRenaming(false)
    }
  }

  return (
    <nav className='flex  items-center justify-between gap-x-2 p-2 bg-sidebar border-b'>
      <div className='flex items-center gap-3 justify-center gap-x-2'>
          <Breadcrumb>
          <BreadcrumbList className='gap-0!'>
           <BreadcrumbItem>
           <BreadcrumbLink asChild className='flex items-start gap-1.5'>
                <Button asChild variant="ghost" className='w-fit! p-1.5! h-7!'>
                 <Link href="/" className='flex items-start'>
                 <Image alt='logo' src="/logo.svg" width={25} height={25}/>
                  <span className="text-3xl">polaris</span>
                 </Link>
                </Button>
           </BreadcrumbLink>
           </BreadcrumbItem>
           <BreadcrumbSeparator className='ml-0! mr-1'/>
           <BreadcrumbItem>
              {isRenameing?(<input autoFocus type='text' value={name} onChange={(e)=>setName(e.target.value)} onFocus={(e)=>e.currentTarget.select()} onBlur={handleKeyDown} onKeyDown={handleKeyDown} className='text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium w-1.5 truncate'/>):(
                <BreadcrumbPage onClick={handleStartRename}>
                {project?.name??"Loading"}
              </BreadcrumbPage>
              )}
           </BreadcrumbItem>
           </BreadcrumbList>
          </Breadcrumb>
          <TooltipProvider>
          {
            project?.importStatus === "importing"?(
              <Tooltip>
                <TooltipTrigger className=''>
                  <LoaderIcon className='size-4 text-muted-foreground animate-spin'/>
                </TooltipTrigger>
                <TooltipContent>
                  Importing...
                </TooltipContent>
                
              </Tooltip>
            ):(
                  <Tooltip >
                <TooltipTrigger>
                  <CloudCheckIcon className=' flex items-center justify-center size-4 text-muted-foreground'/>
                 </TooltipTrigger>
                <TooltipContent>
                  Saved{" "}
                  { project?.updatedAt? formatDistanceToNow(project.updatedAt,{addSuffix:true}):"unknown"}
                </TooltipContent>
                
              </Tooltip>
                
            )
          }
          </TooltipProvider>
      </div>
      <div>
        <UserButton/>
      </div>
    </nav>
  )
}

export default Navbar