'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ProtectedDropdownMenu } from './dropdown-menus'
import { H2 } from './ui/typography'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { CookingPot, ListCheck, MessagesSquare, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'

export function Nav() {
	const { data: session } = useSession()

	let navbar = <PublicNavbar />
	if (session?.user) {
		navbar = <RoutesNavbar />
	}

	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return (
		<div className='text-base-content fixed top-0 z-10 flex w-full justify-center border-b border-b-background bg-gradient-to-b from-background to-background/70 py-2 bg-blend-saturation backdrop-blur transition-all duration-300'>
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
				{theme === 'light' ? <Sun /> : <Moon />}
			</Button>
		</nav>
	)
}

function RoutesNavbar() {
	// const router = useRouter()
	const menuItems = [
		{
			value: '/chat',
			icon: <MessagesSquare />
		},
		{
			value: '/list',
			icon: <ListCheck />
		},
		{
			value: '/recipes',
			icon: <CookingPot />
		}
	]

	return (
		<nav className='grid w-full grid-cols-4 place-items-center items-center bg-transparent'>
			{menuItems.map((item) => (
				<Link href={item.value} key={item.value}>
					<span></span>
					{item.icon}
				</Link>
			))}

			<ProtectedDropdownMenu />
		</nav>
	)
}
  