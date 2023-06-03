export function RecipeByIdLoader() {
  return (
    <div className='flex flex-col'>
      <div
        className='animpulse-pulse h-60 w-96 bg-base-content'
        style={{ animationDuration: '1s' }}
      ></div>

      <div className='m-5 flex flex-col gap-2'>
        <div
          className='h-4 w-4/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.15s' }}
        ></div>
        <div
          className='h-4 w-full animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.25s' }}
        ></div>
        <div
          className='h-4 w-3/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.35s' }}
        ></div>
      </div>
      <div className='stats mb-2 shadow'>
        <div className='stat place-items-center'>
          <div className='stat-title'>Prep Time</div>
          <div
            className='mt-2 h-4 w-3/5 animate-pulse rounded bg-base-content'
            style={{ animationDuration: '1s', animationDelay: '0.45s' }}
          ></div>
        </div>

        <div className='stat place-items-center'>
          <div className='stat-title'>Cook Time</div>
          <div
            className='mt-2 h-4 w-3/5 animate-pulse rounded bg-base-content'
            style={{ animationDuration: '1s', animationDelay: '0.55s' }}
          ></div>
        </div>
      </div>

      <div className='h-12 w-full animate-pulse rounded-md bg-primary px-2'></div>

      <div className='mt-5 flex items-center gap-2 pl-2'>
        <div className='h-7 w-7 animate-pulse rounded-lg bg-primary'></div>
        <div
          className='h-4 w-1/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.65s' }}
        ></div>
      </div>

      <h2 className='divider text-2xl font-bold'>Ingredients</h2>

      <div className='mt-2 flex items-center gap-2 pl-2'>
        <div className='h-7 w-7 animate-pulse rounded-lg bg-primary'></div>
        <div
          className='h-4 w-2/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
      </div>
      <div className='mt-3 flex items-center gap-2 pl-2'>
        <div className='h-7 w-7 animate-pulse rounded-lg bg-primary'></div>
        <div
          className='h-4 w-4/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.85s' }}
        ></div>
      </div>
      <div className='mt-3 flex items-center gap-2 pl-2'>
        <div className='h-7 w-7 animate-pulse rounded-lg bg-primary'></div>
        <div
          className='h-4 w-3/5 animate-pulse rounded bg-base-content'
          style={{ animationDuration: '1s', animationDelay: '0.95s' }}
        ></div>
      </div>
    </div>
  )
}
