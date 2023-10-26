import { ToastOptions, Toaster } from 'react-hot-toast'
import { CheckIcon, ExclamationCircle } from './icons'

export function Toast() {
  return (
    <Toaster
      toastOptions={{
        success: {
          icon: <CheckIcon />,
          style: successToastStyling
        },

        error: {
          icon: <ExclamationCircle />,
          style: {
            // @ts-expect-error replicates the tailwind config
            '--tw-bg-opacity': 1,
            backgroundColor: 'hsl(var(--er) / var(--tw-bg-opacity))',
            '--tw-text-opacity': 1,
            color: 'hsl(var(--erc, var(--nc)) / var(--tw-text-opacity))'
          }
        }
      }}
    />
  )
}

export const successToastStyling: ToastOptions['style'] = {
  // @ts-expect-error replicates the tailwind config
  '--tw-bg-opacity': 1,
  backgroundColor: 'hsl(var(--su) / var(--tw-bg-opacity))',
  '--tw-text-opacity': 1,
  color: 'hsl(var(--suc, var(--nc)) / var(--tw-text-opacity))',
  transitionDuration: '150ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionProperty:
    'color, background-color, border-color, text-decoration-color, fill, stroke'
}

export const loadingToastStyling: ToastOptions['style'] = {
  // @ts-expect-error replicates the tailwind config
  '--tw-bg-opacity': 1,
  backgroundColor: 'hsl(var(--pc) / var(--tw-bg-opacity))',
  '--tw-text-opacity': 1,
  color: 'hsl(var(--bc) / var(--tw-text-opacity, 1))',
  transitionDuration: '150ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionProperty:
    'color, background-color, border-color, text-decoration-color, fill, stroke'
}

export const errorToastStyling: ToastOptions['style'] = {
  // @ts-expect-error replicates the tailwind config
  '--tw-bg-opacity': 1,
  backgroundColor: 'hsl(var(--er) / var(--tw-bg-opacity))',
  '--tw-text-opacity': 1,
  color: 'hsl(var(--erc, var(--nc)) / var(--tw-text-opacity))',
  transitionDuration: '150ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionProperty:
    'color, background-color, border-color, text-decoration-color, fill, stroke'
}

export const infoToastOptions = {
  duration: 6000,
  style: {
    '--tw-bg-opacity': 1,
    backgroundColor: 'hsl(var(--in))',
    '--tw-text-opacity': 1,
    color: 'hsl(var(--inc) / var(--tw-text-opacity))'
  },
  icon: (
    // i icon
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
        d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
      />
    </svg>
  )
}
