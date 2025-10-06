import { BotMessageSquareIcon } from 'lucide-react'

export const AssistantMessageLoader = () => {
  return (
    <div className='bg-transparent pb-4'>
      <div className='mx-auto flex justify-start gap-2'>
        <BotMessageSquareIcon />
        <div className='bg-secondary flex items-center justify-start space-x-1 rounded-md p-3'>
          <div
            style={{ animationDelay: '0.0s', animationDuration: '1s' }}
            className='bg-secondary-foreground h-2 w-2 animate-pulse rounded-full'
          ></div>
          <div
            style={{ animationDelay: '0.25s', animationDuration: '1s' }}
            className='bg-secondary-foreground h-2 w-2 animate-pulse rounded-full'
          ></div>
          <div
            style={{ animationDelay: '0.5s', animationDuration: '1s' }}
            className='bg-secondary-foreground h-2 w-2 animate-pulse rounded-full'
          ></div>
        </div>
      </div>
    </div>
  )
}
