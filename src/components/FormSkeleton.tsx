export function FormSkeleton() {
  return (
    <div className='mt-2 flex flex-col'>
      <label className='text-sm'>Title</label>
      <div className='h-4 w-52 animate-pulse rounded bg-slate-800 '></div>
      <label className='text-sm'>Description</label>
      <div className='h-4 w-full animate-pulse rounded bg-slate-800'></div>
      <label className='text-sm'>Ingredients</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 w-1/2 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-1/2 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/4 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-1/2 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/4 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-1/2 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/4 animate-pulse rounded bg-slate-800'></div>
      </div>
      <label className='text-sm'>Instructions</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 w-4/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-1/2 animate-pulse rounded bg-slate-800'></div>
        <div className='h-1'></div>
        <div className='h-4 w-4/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-4/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-1/3 animate-pulse rounded bg-slate-800'></div>
        <div className='h-1'></div>
        <div className='h-4 w-4/5 animate-pulse rounded bg-slate-800'></div>
        <div className='h-4 w-3/5 animate-pulse rounded bg-slate-800'></div>
      </div>
    </div>
  )
}
