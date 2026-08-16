import React from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Conversation } from 'openai/resources/conversations/conversations.mjs'
import { useConversations } from '../hooks/use-conversations'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { formatDistanceToNow } from 'date-fns'



interface PastConversationDialogprops{
    projectId:Id<"projects">,
    open:boolean,
    onOpenChange : (open:boolean)=>void,
    onSelect : (conversationId:Id<"conversations">)=>void
}

const PastConversationDialog = ({onOpenChange,open,projectId,onSelect}:PastConversationDialogprops) => {
    const conversations = useConversations(projectId);
    const handleSelect = (conversationId:Id<"conversations">)=>{
       onSelect(conversationId)
       onOpenChange(false);
    }
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title='Past conversation' description='Search and select a past conversation '>
      <CommandInput  placeholder='search conversation ...'/>
      <CommandList>
        <CommandEmpty>no conversation found.</CommandEmpty>
        <CommandGroup heading="Conversation">
            {
                conversations?.map((conversation)=>{
                 return <CommandItem key={conversation._id} value={`${conversation.title}-${conversation._id} `} onSelect={()=>handleSelect(conversation._id)}>
                    <div className='flex flex-col gap-0.5'>
                        <span>{conversation.title}</span>
                      <span>{formatDistanceToNow(conversation._creationTime,{addSuffix:true})}</span>
                    </div>
                 </CommandItem>
                })
            }
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default PastConversationDialog