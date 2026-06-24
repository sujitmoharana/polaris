import { cn } from '@/lib/utils'
import { getItemPadding } from './constant'
import { Spinner } from '@/components/ui/spinner'

const LoadingRow = ({className,level}:{className?:string,level:number}) => {
  return (
    <div className={cn("h-5.5 flex items-center text-muted-foreground",className)} style={{paddingLeft:getItemPadding(level,true)}}>
       <Spinner className='size-4 text-ring ml-0.5'/>
    </div>
  )
}

export default LoadingRow