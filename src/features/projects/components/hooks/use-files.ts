import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

export const useCreateFile = ()=>{
      return useMutation(api.file.createFile)
}
export const useCreateFolder = ()=>{
      return useMutation(api.file.createFolder)
}
export const useRenameFile = ()=>{
      return useMutation(api.file.rename)
}
export const useDeleteFile = ()=>{
      return useMutation(api.file.deleteFile)
}

export const useFolderContains =({projectId,parentId,enabled = true}:{projectId:Id<"projects">,parentId?:Id<"files">,enabled?:boolean})=>{
      return useQuery(api.file.getFolderContents,enabled?{projectId:projectId,parentId:parentId}:"skip")
}



