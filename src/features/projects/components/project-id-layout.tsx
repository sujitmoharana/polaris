"use client"

import React from 'react'
import Navbar from './navbar'
import { Id } from '../../../../convex/_generated/dataModel'
import {Allotment} from "allotment"
import "allotment/dist/style.css";

const MIN_SIDEBAR_WIDTH =200;
const MAX_SIDEBAR_WIDTH =800;
const DEFAULT_CONSERVATION_SIDEBAR_WIDTH =400;
const DEFAULT_MAIN_SIZE =1000;




const ProjectIdLayout = ({projectId,children}:{projectId:Id<"projects">,children:React.ReactNode}) => {
  return (
    <div className='flex flex-col h-screen w-full'>
        <Navbar projectId={projectId}/>
        <div className='flex-1 flex overflow-hidden'>
          <Allotment className='flex-1 ' defaultSizes={[DEFAULT_CONSERVATION_SIDEBAR_WIDTH,DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane snap minSize={MIN_SIDEBAR_WIDTH} maxSize={MAX_SIDEBAR_WIDTH} preferredSize={DEFAULT_CONSERVATION_SIDEBAR_WIDTH}>
               <div>
                conservation sidebar
               </div>
            </Allotment.Pane>
            <Allotment.Pane  >
        {children}
        </Allotment.Pane>
        </Allotment>
        </div>
    </div>
  )
}

export default ProjectIdLayout