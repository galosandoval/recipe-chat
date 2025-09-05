export function FormLoader() {
  return (
    <div className='mt-2 flex flex-col p-5'>
      <label htmlFor='name' className='label'>
        <span className='label-text'>Name</span>
      </label>
      <div
        className='bg-secondary h-4 w-52 animate-pulse rounded p-5'
        style={{ animationDuration: '1s', animationDelay: '0.0s' }}
      ></div>
      <label htmlFor='description' className='label'>
        <span className='label-text'>Description</span>
      </label>
      <div
        className='bg-secondary h-4 w-72 animate-pulse rounded p-5'
        style={{ animationDuration: '1s', animationDelay: '0.25s' }}
      ></div>
      <div className='flex gap-2'>
        <div className='flex w-1/2 flex-col'>
          <label htmlFor='prepTime' className='label'>
            <span className='label-text'>Prep time</span>
          </label>
          <div
            className='bg-secondary h-4 w-1/2 animate-pulse rounded p-5'
            style={{ animationDuration: '1s', animationDelay: '0.5s' }}
          ></div>
        </div>
        <div className='flex w-1/2 flex-col'>
          <label htmlFor='cookTime' className='label'>
            <span className='label-text'>Cook time</span>
          </label>
          <div
            className='bg-secondary h-4 w-1/2 animate-pulse rounded p-5'
            style={{ animationDuration: '1s', animationDelay: '0.5s' }}
          ></div>
        </div>
      </div>
      <label htmlFor='ingredients' className='label'>
        <span className='label-text'>Ingredients</span>
      </label>
      <div className='flex flex-col gap-3 p-5'>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/4 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/4 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/4 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/4 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '0.75s' }}
        ></div>
      </div>
      <label htmlFor='instructions' className='label'>
        <span className='label-text'>Instructions</span>
      </label>
      <div className='flex flex-col gap-3 p-5'>
        <div
          className='bg-secondary h-4 w-4/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/2 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div className='h-1'></div>
        <div
          className='bg-secondary h-4 w-4/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-4/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-1/3 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div className='h-1'></div>
        <div
          className='bg-secondary h-4 w-4/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div className='h-1'></div>
        <div
          className='bg-secondary h-4 w-4/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
        <div
          className='bg-secondary h-4 w-3/5 animate-pulse rounded'
          style={{ animationDuration: '1s', animationDelay: '1s' }}
        ></div>
      </div>
    </div>
  )
}
