import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"
import { useAuth } from "@clerk/nextjs"


export const useproject = ()=>{
    return useQuery(api.projects.get)
}
export const useprojectspartial = (limit:number)=>{
    return useQuery(api.projects.getPartial,{limit})
}
export const useCreateProject = ()=>{
    const {userId} = useAuth();
    return useMutation(api.projects.create).withOptimisticUpdate(
        (localstore,args)=>{
          const existingProject = localstore.getQuery(api.projects.get)
          console.log("existingproject",existingProject);
          if (existingProject !== undefined) {
            const now = Date.now();
            const newProject = {
               _id:crypto.randomUUID() as Id<"projects">,
               _creationTime:now,
               name:"sujit",
               ownerId:userId,
               updatedAt:now
            }
            localstore.setQuery(api.projects.get,{},[newProject,...existingProject])
          }
        }
    )
}
