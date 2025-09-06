'use client'

import { Interface } from './interface'
import { SubmitMessageForm } from './submit-message-form'
import { BottomActiveFilters } from './bottom-active-filters'

export default function Chat() {
  return (
    <div className='relative flex h-full w-full flex-1 flex-col'>
      <Interface />
      <BottomActiveFilters />
      <SubmitMessageForm />
    </div>
  )
}
