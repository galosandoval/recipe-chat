import { LoaderCircle } from 'lucide-react'

export default function PageLoading() {
	return (
		<div className='h-app-screen grid place-items-center'>
			<Spinner />
		</div>
	)
}

export function Spinner() {
	return <LoaderCircle className='animate-spin' />
}
