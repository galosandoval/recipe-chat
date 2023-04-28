export function FormSkeleton() {
  return (
    <div className='mt-2 flex animate-pulse flex-col'>
      <label className='text-sm'>Title</label>
      <div className='h-4 w-52 rounded'></div>
      <label className='text-sm'>Description</label>
      <div className='h-4 w-full rounded'></div>
      <label className='text-sm'>Ingredients</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
      </div>
      <label className='text-sm'>Instructions</label>
      <div className='flex flex-col gap-3'>
        <div className='h-5 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
        <div className='h-4 w-1/2 rounded'></div>
      </div>
    </div>
  )
}
