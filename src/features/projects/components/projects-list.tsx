
import { Spinner } from "@/components/ui/spinner"
import { useprojectspartial } from "./hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Doc } from "../../../../convex/_generated/dataModel"
import Link from "next/link"
import { AlertCircleIcon, ArrowRightIcon, GlobeIcon, Loader2Icon, LoaderCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { FaGithub } from "react-icons/fa"

const formatTimestamp = (timestamp:number)=>{
    return formatDistanceToNow(new Date((timestamp)),{addSuffix:true})
}
interface ProjectlistProps{
    onViewAll:()=>void
}

const getProjecticon =(projects:Doc<"projects">)=>{
  if(projects.importStatus === "completed"){
      return <FaGithub className="size-3.5 text-muted-foreground"/>
  }
  if(projects.importStatus === "failed"){
      return <AlertCircleIcon className="size-3.5 text-muted-foreground"/>
  }
  if(projects.importStatus === "importing"){
      return <LoaderCircle className="size-3.5 text-muted-foreground animate-spin"/>
  }
  return <GlobeIcon className="size-3.5 text-muted-foreground"/>
}

const ContinueCard = ({data}:{data:Doc<"projects">})=>{
  return(
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">
        last Updated
      </span>
      <Button variant="outline" className="h-auto   flex items-start justify-start p-4 bg-background border rounded-none flex-col gap-2">
         <Link href={`/projects/${data._id}`} className="group flex flex-col items-start gap-2">
         <div className="flex justify-between  items-center w-full">
            <div className="flex items-center gap-2">
                {getProjecticon(data)}
                <span className="font-medium truncate text-white">
                      {data.name}
                </span>
            </div>
            <ArrowRightIcon className="w-full size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform"/>
         </div>
         <span className="text-xs text-muted-foreground">
            {formatTimestamp(data.updatedAt)}
         </span>
         </Link>
      </Button>
    </div>
  )
}


const ProjectItem = ({data}:{data:Doc<"projects">})=>{
return(
  <Link href={`/projects/${data._id}`} className="text-sm text-foreground font-medium hover:text-foreground py-1 flex items-center justify-between w-full group">
        
        <div className="flex items-center gap-2">
               {getProjecticon(data)}
               <span className="truncate ">
                  {data.name}
               </span>
        </div>

        <span className="text-xs text-shadow-muted-foreground group-hover:text-foreground/60 transition-colors">
          {formatTimestamp(data.updatedAt)}
        </span>

  </Link>
)
}

export const ProjectList=({onViewAll}:ProjectlistProps)=>{
    const projects = useprojectspartial(6)
    if (!projects || projects.length === 0) {
        return <Spinner className="size-4 text-ring"/>
    }

    const [mostRecent,...rest] = projects;
    return (
        <div className="flex w-full flex-col gap-4">
         {mostRecent? <ContinueCard data={mostRecent}/>:null}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-xs  text-muted-foreground">
                  Recent projects
                </span>
                <Button onClick={onViewAll} variant="ghost" className="flex items-center gap-2 text-muted-foreground text-xs bg-background transition-colors ">
                  <span>view all</span>
                  <Kbd className="bg-accent border ">
                    Ctrl+k
                  </Kbd>
                </Button>
              </div>
              <ul>
                {rest.map((projects)=>(
                   <ProjectItem key={projects._id} data={projects }/>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
}