'use client'

import toast, {
    type ToastOptions,
    Toaster,
    useToasterStore,
    ToastBar
} from 'react-hot-toast'
import { CheckIcon, ExclamationCircle } from './icons'

export function Toast() {
    const { toasts } = useToasterStore()

    const lastToastId = toasts.at(-1)?.id

    const handleClickToaster = () => {
        toast.dismiss(lastToastId)
    }

    return (
        <button onClick={handleClickToaster}>
            <Toaster
                toastOptions={{
                    success: successToastOptions,

                    error: errorToastOptions
                }}
            >
                {(t) => (
                    <div onClick={() => toast.dismiss(t.id)}>
                        <ToastBar toast={t} />
                    </div>
                )}
            </Toaster>
        </button>
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
    backgroundColor: 'hsl(var(--in))',
    '--tw-text-opacity': 1,
    color: 'hsl(var(--inc) / var(--tw-text-opacity))',
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

export const loadingToastOptions: ToastOptions = {
    icon: (
        // spinner
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6 animate-spin'
        >
            <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
            />
        </svg>
    ),
    style: loadingToastStyling
}

export const successToastOptions: ToastOptions = {
    icon: <CheckIcon />,
    style: successToastStyling
}

export const errorToastOptions: ToastOptions = {
    icon: <ExclamationCircle />,
    style: errorToastStyling
}

export const infoToastOptions: ToastOptions = {
    duration: 6000,
    style: loadingToastStyling,
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
