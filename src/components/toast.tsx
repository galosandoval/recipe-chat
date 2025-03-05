'use client'

import { toast, type ToastT } from 'sonner'
import { Toaster as _Toaster } from '~/components/ui/sonner'
import { CircleCheckBig, Loader } from 'lucide-react'

export function Toaster() {
	return <_Toaster position='top-center' />
}

export const errorToast = (message: string) =>
	toast.error(message, { duration: 6000 })

export const loadingToastOptions = {
	icon: <Loader className='animate-spin' />
}

export const errorToastOptions: ToastT = {
	// icon: <ExclamationCircle />,
	// className: 'bg-destructive text-destructive-foreground',
	id: 'error',
	type: 'error'
}

export const successToastOptions = {
	icon: <CircleCheckBig />,
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
