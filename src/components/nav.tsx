'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ProtectedDropdownMenu } from './dropdown-menus'
import { H2 } from './ui/typography'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { BookOpen, ListCheck, MessagesSquare, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'
import {
	NavigationMenu,
	NavigationMenuItem,
	navigationMenuTriggerStyle,
	NavigationMenuLink,
	NavigationMenuList
} from './ui/navigation-menu'
import { cn } from '~/lib/utils'

export function NavContainer() {
	return (
		<div className='text-base-content fixed top-0 z-10 flex w-full justify-center border-b border-b-background bg-gradient-to-b from-background to-background/70 py-2 bg-blend-saturation backdrop-blur transition-all duration-300'>
			<h1 className='text-xl font-bold'>RecipeChat</h1>
			<Nav />
		</div>
	)
}

function Nav() {
	const { data: session } = useSession()
	// this fixes the hydration error created by next-themes
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	if (!mounted) {
		return null
	}
	if (session?.user) {
		return <RoutesNavbar />
	}
	return <PublicNavbar />
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

const menuItems = [
	{
		href: '/',
		icon: <MessagesSquare className='h-4 w-4' />,
		label: 'Chat'
	},
	{
		href: '/list',
		icon: <ListCheck className='h-4 w-4' />,
		label: 'List'
	},
	{
		href: '/recipes',
		icon: <BookOpen className='h-4 w-4' />,
		label: 'Recipes'
	}
]

function RoutesNavbar() {
	return (
		<NavigationMenu className='w-full'>
			<NavigationMenuList>
				{menuItems.map((item) => (
					<NavigationMenuItem key={item.label}>
						<Link href={item.href} legacyBehavior passHref>
							<NavigationMenuLink
								className={cn(
									'gap-1',
									navigationMenuTriggerStyle()
								)}
							>
								{item.icon}
								{item.label}
							</NavigationMenuLink>
						</Link>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
			<ProtectedDropdownMenu />
		</NavigationMenu>
	)
}

function NavLink({
	href,
	icon,
	label
}: {
	href: string
	icon: React.ReactNode
	label: string
}) {
	return (
		<Link href={href}>
			<Button variant='ghost' className='flex text-xs'>
				{icon}
				{label}
			</Button>
		</Link>
	)
}
