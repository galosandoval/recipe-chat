import { Toaster } from 'react-hot-toast'

export function Toast() {
  return (
    <Toaster
      toastOptions={{
        success: {
          icon: (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4.5 12.75l6 6 9-13.5'
              />
            </svg>
          ),
          style: {
            // @ts-expect-error replicates the tailwind config
            '--tw-bg-opacity': 1,
            backgroundColor: 'hsl(var(--su) / var(--tw-bg-opacity))',
            '--tw-text-opacity': 1,
            color: 'hsl(var(--suc, var(--nc)) / var(--tw-text-opacity))'
          }
        },

        error: {
          icon: (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
              />
            </svg>
          ),
          style: {
            // @ts-expect-error replicates the tailwind config
            '--tw-bg-opacity': 1,
            backgroundColor: 'hsl(var(--er) / var(--tw-bg-opacity))',
            '--tw-text-opacity': 1,
            color: 'hsl(var(--erc, var(--nc)) / var(--tw-text-opacity))'
          }
        }

        // iconTheme: {
        //   primary: 'hsl(var(--su) / var(--tw-bg-opacity))',
        //   secondary: 'hsl(var(--suc, var(--nc)) / var(--tw-text-opacity))'
        // },
        // style: {
        //   backgroundColor: 'hsl(var(--b1) / var(--tw-bg-opacity))',
        //   // @ts-expect-error replicates the tailwind config
        //   '--tw-bg-opacity': 1,
        //   color: 'hsl(var(--bc) / var(--tw-text-opacity))'
        // },

        // duration: Infinity
      }}
    />
  )
}
