import { UserCircleIcon } from '~/components/icons'

export const ChatLoader = () => {
  return (
    <div className='bg-base-100 pb-4'>
      <div className='prose mx-auto flex justify-start gap-2'>
        <UserCircleIcon />
        <div className='flex items-center justify-start space-x-1'>
          <div
            style={{ animationDelay: '0.0s', animationDuration: '1s' }}
            className='bg-base-content h-2 w-2 animate-pulse rounded-full'
          ></div>
          <div
            style={{ animationDelay: '0.25s', animationDuration: '1s' }}
            className='bg-base-content h-2 w-2 animate-pulse rounded-full'
          ></div>
          <div
            style={{ animationDelay: '0.5s', animationDuration: '1s' }}
            className='bg-base-content h-2 w-2 animate-pulse rounded-full'
          ></div>
        </div>
      </div>
    </div>
  )
}
