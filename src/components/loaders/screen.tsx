import { LoadingSpinner } from './loading-spinner'

export function ScreenLoader() {
  return (
    <div className='fixed inset-0 z-50 h-svh bg-transparent pt-8'>
      <div className='bg-base-100 grid h-full w-full place-items-center'>
        <LoadingSpinner />
      </div>
    </div>
  )
}
