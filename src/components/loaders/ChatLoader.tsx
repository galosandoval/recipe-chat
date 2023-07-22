import { UserCircleIcon } from 'components/Icons'

export const ChatLoader = () => {
  return (
    <div className='bg-primary-content py-4 pb-4 pl-4'>
      <div className='prose mx-auto flex justify-start gap-2'>
        <UserCircleIcon />
        <div className='flex items-center justify-start space-x-1'>
          <div
            style={{ animationDelay: '0.0s', animationDuration: '1s' }}
            className='h-2 w-2 animate-pulse rounded-full bg-base-content'
          ></div>
          <div
            style={{ animationDelay: '0.25s', animationDuration: '1s' }}
            className='h-2 w-2 animate-pulse rounded-full bg-base-content'
          ></div>
          <div
            style={{ animationDelay: '0.5s', animationDuration: '1s' }}
            className='h-2 w-2 animate-pulse rounded-full bg-base-content'
          ></div>
        </div>
      </div>
    </div>
  )
}
