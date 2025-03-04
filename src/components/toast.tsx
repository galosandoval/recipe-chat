'use client'

import { toast, type ToastT } from 'sonner'
import { CheckIcon, ExclamationCircle } from './icons'
import { Toaster as _Toaster } from '~/components/ui/sonner'

export function Toaster() {
	return <_Toaster position='top-center' />
}

export const errorToast = (message: string) =>
	toast.error(message, { duration: 6000 })

export const loadingToastOptions = {
	icon: (
		// spinner
		<svg
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			strokeWidth={1.5}
			stroke='currentColor'
			className='bg-er h-6 w-6 animate-spin'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99'
			/>
		</svg>
	)
}

const baseToastClass = 'bg-error'

export const errorToastOptions: ToastT = {
	// icon: <ExclamationCircle />,
	// className: 'bg-destructive text-destructive-foreground',
	id: 'error',
	type: 'error'
}

export const successToastOptions = {
	icon: <ExclamationCircle />,
	className: 'bg-error text-error-content'
}

export const infoToastOptions = {
	duration: 6000,
	className: 'bg-info text-info-content',
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
