export function ScreenLoader() {
  return (
    <div className='grid h-[calc(100svh-64px)] place-items-center'>
      <LoadingSpinner />
    </div>
  )
}

export function LoadingSpinner() {
  return <span className='loading loading-spinner text-primary'></span>
}
