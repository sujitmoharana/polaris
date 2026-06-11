import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"
import { useAuth } from "@clerk/nextjs"

export const useproject = (projectId:Id<"projects">)=>{
    return useQuery(api.projects.getById,{id:projectId})
}

export const useprojects = ()=>{
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

export const useRenameProject = (projectId:Id<"projects">)=>{
  return useMutation(api.projects.rename).withOptimisticUpdate(
      (localstore,args)=>{
        const existingProject = localstore.getQuery(api.projects.getById,{id:projectId})
        console.log(localstore.getQuery(api.projects.getById,{id:projectId}));
        console.log("existingproject",existingProject);
        if (existingProject !== undefined && existingProject !== null) {
          console.log("log2",localstore.setQuery(api.projects.getById,{id:projectId},{...existingProject,name:args.name,updatedAt:Date.now()}));
          localstore.setQuery(api.projects.getById,{id:projectId},{...existingProject,name:args.name,updatedAt:Date.now()})
        }
        const existingProjects = localstore.getQuery(api.projects.get)
        console.log("existingProjects",existingProjects);
        if (existingProjects !== undefined) {
          localstore.setQuery(api.projects.get,{},existingProjects.map((project)=>{
            return project._id===args.id ? {...project,name:args.name,updatedAt:Date.now()} : project
          }))
        }
      }
  )
}
