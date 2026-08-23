import React, { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Conversation,ConversationContent,ConversationScrollButton, } from '@/components/ai-elements/conversation'
import { Message,MessageContent,MessageResponse,MessageAction,MessageActions } from '@/components/ai-elements/message'
import { PromptInput,PromptInputBody,PromptInputFooter,PromptInputSubmit,PromptInputTextarea,PromptInputTools,type PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { CopyCheck, CopyIcon,HistoryIcon,LoaderIcon,PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConversation, useConversations, useCreateConversations, useMessages } from '../hooks/use-conversations'
import { toast } from 'sonner'
import ky from 'ky'
import PastConversationDialog from './post-conversations'
import { DEFAULT_CONVERSATION_TITLE } from '../constant'
interface ConversationSideBarProps{
    projectId:Id<"projects">
}

const ConversationSideBar = ({projectId}:ConversationSideBarProps) => {
    const [input,setInput] = useState("")
    const [pastConversationsOpen,setpastConversationsOpen] = useState(false);
    const [selectConversationId,setSelectConversationId] = useState<Id<"conversations">|null>(null)
    const CreateConversation = useCreateConversations()
    console.log("CreateConversation1",CreateConversation);
    const conversations = useConversations(projectId)
    console.log("conversations2",conversations);
    const activeConversationId = selectConversationId ?? conversations?.[0]?._id ?? null
    console.log("activeConversationId",activeConversationId);
    const activeConversation = useConversation(activeConversationId);
    console.log("activeConversation",activeConversation);
    const conversationMessages = useMessages(activeConversationId);
    console.log("conversationMessages",conversationMessages);
     
    //check if any message is currently processing
    const isprocessing = conversationMessages?.some((msg)=>{
         return msg.status ==="processing"
    }) 

    const handleCancel = async ()=>{
          try {
            await ky.post("/api/messages/cancel",{
                json:{projectId:projectId}
            })
          } catch (error) {
            toast.error("unable to cancel request");
          }
    }
     console.log("isprocessing",isprocessing);
    const handlecreateConversation = async()=>{
        try {
            const newConversationId = await CreateConversation({
                projectId:projectId,
                title:DEFAULT_CONVERSATION_TITLE
            })
            console.log("newconversenId",newConversationId);
            setSelectConversationId(newConversationId)
            return newConversationId
        } catch {
            toast.error("Unable to create new Conversation");
            return null
        }
    }

    const handleSubmit = async(message:PromptInputMessage)=>{
        console.log("processing",isprocessing);
        console.log("mesage",message);
      //if processing and no new message,this is just a stop function
      if (isprocessing && !message.text) {
        //Todo:await handleecel()
        await handleCancel()
        setInput("")
        return;
      }

      let conversationId = activeConversationId;
      console.log("conversionId",conversationId);
      if (!conversationId) {
        conversationId = await handlecreateConversation();
        if (!conversationId) {
            return;
        }
      }

      try {
        await ky.post("/api/messages",{
            json:{
                conversationId:conversationId,
                message:message.text
            }
        })
        console.log("sucess");
        
      } catch (error) {
        console.log("errpr",error);
        toast.error("Message failed to send")
      }
       setInput("")
    }
  return (
  <>
  <PastConversationDialog projectId={projectId} open={pastConversationsOpen} onOpenChange={setpastConversationsOpen} onSelect={setSelectConversationId} />
    <div className='flex flex-col h-full bg-sidebar'>
        <div className='h-8 flex items-center justify-between border-b'>
            <div className='text-sm truncate pl-3'>
                {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </div>
            <div className='flex items-center px-1 gap-1'>
               <Button onClick={()=>setpastConversationsOpen(true)} variant="highlight" size="icon-xs">
                  <HistoryIcon className="size-3.5"/>
               </Button>
               <Button onClick={handlecreateConversation} variant="highlight" size="icon-xs">
                  <PlusIcon className='size-3.5' />
               </Button>
            </div>
        </div>
        <Conversation className='flex-1'>
            <ConversationContent>
               {
                conversationMessages?.map((message,messageindex)=>{
                    return <Message key={message._id} from={message.role}>
                        <MessageContent>
                            {message.status ==="processing" ? (
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <LoaderIcon className='size-4 animate-spin'/>
                                    <span>Thinking...</span>
                                </div>
                            ):message.status === "cancelled" ? (
                                <span className='text-muted-foreground italic'>
                                    requested cancelled
                                </span>   
                            ):(
                                <MessageResponse>
                                    {message.content}
                                </MessageResponse>
                            )}
                        </MessageContent>
                        {message.role === "assistant" && message.status === "completed" && messageindex === (conversationMessages.length ?? 0)-1 && (
                            <MessageActions>
                                <MessageAction onClick={()=>{
                                    navigator.clipboard.writeText(message.content)
                                }} label='Copy'>

                                    <CopyCheck/>
                                    
                                </MessageAction>
                            </MessageActions>
                        )}
                    </Message>
                })
               }
            </ConversationContent>
            <ConversationScrollButton/>
        </Conversation>
        <div className='p-3'>
           <PromptInput onSubmit={handleSubmit} className='mt-2' >
              <PromptInputBody>
                <PromptInputTextarea placeholder='Ask polaris anything...' onChange={(e)=>setInput(e.target.value)} value={input} disabled={false}>
                </PromptInputTextarea>
              </PromptInputBody>
              <PromptInputFooter>
                  <PromptInputTools/>
                  <PromptInputSubmit disabled={isprocessing?false:!input} status={isprocessing ? "streaming" :undefined}/>
              </PromptInputFooter>
           </PromptInput>
        </div>
        </div>
  </>
  )
}

export default ConversationSideBar