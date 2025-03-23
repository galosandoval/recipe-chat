'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { NavDropdownMenu } from './dropdown-menus'
import { BookOpen, ListCheck, MessagesSquare } from 'lucide-react'
import { useState } from 'react'
import { useEffect } from 'react'
import {
	NavigationMenu,
	NavigationMenuItem,
	navigationMenuTriggerStyle,
	NavigationMenuLink,
	NavigationMenuList
} from './ui/navigation-menu'
import { useParams, usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'

export function NavContainer() {
	return (
		<div className='fixed top-0 z-10 flex w-full flex-col items-center justify-center backdrop-blur'>
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
	return (
		<>
			<AppName rightSlot={<NavDropdownMenu />} />
		</>
	)
}

function RoutesNavbar() {
	const { lang } = useParams<{ lang: string }>()
	const menuItems = [
		{
			href: `/${lang}`,
			icon: <MessagesSquare className='h-4 w-4' />,
			label: 'Chat'
		},
		{
			href: `/${lang}/list`,
			icon: <ListCheck className='h-4 w-4' />,
			label: 'List'
		},
		{
			href: `/${lang}/recipes`,
			icon: <BookOpen className='h-4 w-4' />,
			label: 'Recipes'
		}
	]
	return (
		<>
			<AppName />
			<div className='flex w-full flex-1 justify-center border-b bg-muted p-1 dark:border-b-muted'>
				<NavigationMenu className='flex w-full max-w-screen-sm flex-1 justify-between px-4'>
					<NavigationMenuList>
						{menuItems.map((item) => (
							<NavigationMenuItem key={item.label}>
								<NavLink {...item} />
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
					<NavDropdownMenu />
				</NavigationMenu>
			</div>
		</>
	)
}

function AppName({ rightSlot }: { rightSlot?: React.ReactNode }) {
	return (
		<div className='grid w-full grid-cols-3 border-b dark:border-b-muted'>
			<div></div>
			<h1 className='justify-self-center py-1 text-xl font-bold'>
				RecipeChat
			</h1>
			<div className='justify-self-end'>{rightSlot}</div>
		</div>
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
	const isActive = usePathname() === href
	return (
		<Link href={href} legacyBehavior passHref>
			<NavigationMenuLink
				className={cn(
					navigationMenuTriggerStyle(),
					'gap-1 bg-muted text-muted-foreground',
					isActive && 'bg-background text-foreground'
				)}
			>
				{icon}
				{label}
			</NavigationMenuLink>
		</Link>
	)
}
