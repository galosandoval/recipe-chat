import { cn } from '~/lib/utils'

export function H1({ children }: { children: React.ReactNode }) {
	return (
		<h1 className='scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'>
			{children}
		</h1>
	)
}

export function H2({
	children,
	className
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<h2
			className={cn(
				'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
				className
			)}
		>
			{children}
		</h2>
	)
}

export function H3({
	children,
	className
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<h3
			className={cn(
				'scroll-m-20 text-2xl font-semibold tracking-tight',
				className
			)}
		>
			{children}
		</h3>
	)
}

export function H4({
	children,
	className
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<h4
			className={cn(
				'scroll-m-20 text-xl font-semibold tracking-tight',
				className
			)}
		>
			{children}
		</h4>
	)
}

export function P({ children }: { children: React.ReactNode }) {
	return <p className='leading-7 [&:not(:first-child)]:mt-6'>{children}</p>
}

export function Lead({ children }: { children: React.ReactNode }) {
	return <p className='text-xl text-muted-foreground'>{children}</p>
}

export function Large({ children }: { children: React.ReactNode }) {
	return <div className='text-lg font-semibold'>{children}</div>
}

export function Small({ children }: { children: React.ReactNode }) {
	return (
		<small className='text-sm font-medium leading-none'>{children}</small>
	)
}

export function Muted({ children }: { children: React.ReactNode }) {
	return <p className='text-sm text-muted-foreground'>{children}</p>
}
