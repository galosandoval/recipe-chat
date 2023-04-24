export function FormSkeleton() {
  return (
    <div className='mt-2 flex animate-pulse flex-col'>
      <label className='text-sm text-gray-600'>Title</label>
      <div className='h-4 w-52 rounded bg-slate-200 dark:bg-gray-600'></div>
      <label className='text-sm text-gray-600'>Description</label>
      <div className='h-4 w-full rounded bg-slate-200 dark:bg-gray-600'></div>
      <label className='text-sm text-gray-600'>Ingredients</label>
      <div className='flex flex-col gap-3'>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
      </div>
      <label className='text-sm text-gray-600'>Instructions</label>
      <div className='flex flex-col gap-3'>
        <div className='h-5 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
        <div className='h-4 w-1/2 rounded bg-slate-200 dark:bg-gray-600'></div>
      </div>
    </div>
  )
}
