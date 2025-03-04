'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useSession } from 'next-auth/react'
import { ListBulletIcon, MoonIcon, SunIcon } from './icons'
import { ChatBubbleLeftRightIcon } from './icons'
import Link from 'next/link'
import { ProtectedDropdownMenu } from './dropdown-menus'
import { H2 } from './ui/typography'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'

export function Nav() {
	const { data: session, status } = useSession()

	console.log('session', session)
	console.log('status', status)
	let navbar = <PublicNavbar />
	if (session?.user) {
		navbar = <RoutesNavbar />
	}

	return (
		<div className='fixed top-0 z-10 flex w-full justify-center border-b border-b-base-300 bg-gradient-to-b from-base-100 to-base-100/70 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300'>
			{navbar}
		</div>
	)
}

function PublicNavbar() {
	const t = useTranslations()
	const { theme, setTheme } = useTheme()
	console.log('theme', theme)

	const handleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	return (
		<nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent'>
			<div></div>
			<H2 className='my-0 border-b-0 pb-0'>{t.nav.appName}</H2>
			<Button size='icon' onClick={handleTheme}>
				{/* {showLabel ? t.nav.menu.theme : null} */}
				{theme === 'light' ? <SunIcon /> : <MoonIcon />}
			</Button>
		</nav>
	)
}

function RoutesNavbar() {
	// const router = useRouter()
	const menuItems = [
		{
			value: '/chat',
			icon: <ChatBubbleLeftRightIcon />
		},
		{
			value: '/list',
			icon: <ListBulletIcon />
		},
		{
			value: '/recipes',
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
						d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
					/>
				</svg>
			)
		}
	]

	// const activeLinkStyles = (path: string) => {
	// 	let styles =
	// 		'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-base-content'

	// 	if (router.asPath === path) {
	// 		styles =
	// 			'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-primary'
	// 	}

	// 	return styles
	// }

	// const activeSpanStyles = (path: string) => {
	// 	let styles = 'absolute top-10 h-1 w-full bg-transparent'

	// 	if (router.asPath === path) {
	// 		styles = 'absolute top-10 h-1 w-full bg-primary'
	// 	}

	// 	return styles
	// }

	return (
		<nav className='grid w-full grid-cols-4 place-items-center items-center bg-transparent'>
			{menuItems.map((item) => (
				<Link
					// className={activeLinkStyles(item.value)}
					href={item.value}
					key={item.value}
				>
					<span
					// className={activeSpanStyles(item.value)}
					></span>
					{item.icon}
				</Link>
			))}

			<ProtectedDropdownMenu />
		</nav>
	)
}
  