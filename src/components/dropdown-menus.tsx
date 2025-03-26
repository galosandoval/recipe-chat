'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { useTheme } from 'next-themes'
import {
	EllipsisVertical,
	LogIn,
	LogOut,
	Moon,
	Plus,
	Sun,
	UserPlus
} from 'lucide-react'
import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from './ui/dropdown-menu'
import chatStore from '~/lib/chat-store'
import { useParams, usePathname } from 'next/navigation'
import { useSessionChatId } from '~/hooks/use-chat'
export function NavDropdownMenu() {
	const t = useTranslations()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost'>
					<EllipsisVertical className='h-5 w-5' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56'>
				<DropdownMenuLabel>
					{t.components.dropdownMenus.settings}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ThemeMenuItem />
				<StartNewChatMenuItem />

				<DropdownMenuSeparator />
				<AuthMenuItems />
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function ThemeMenuItem() {
	const t = useTranslations()
	const { theme, setTheme, systemTheme } = useTheme()

	let icon = <Sun />
	let text = t.components.dropdownMenus.light

	if (theme === 'system') {
		text = t.components.dropdownMenus.system
	} else if (theme === 'light') {
		text = t.components.dropdownMenus.dark
	} else if (theme === 'dark') {
		text = t.components.dropdownMenus.light
	}

	if ((theme === 'system' && systemTheme === 'light') || theme === 'light') {
		icon = <Moon />
	} else if (
		(theme === 'system' && systemTheme === 'dark') ||
		theme === 'dark'
	) {
		icon = <Sun />
	}

	const handleTheme = () => {
		if (theme === 'system' && systemTheme === 'light') {
			setTheme('dark')
		} else if (theme === 'system' && systemTheme === 'dark') {
			setTheme('light')
		} else {
			setTheme(theme === 'light' ? 'dark' : 'light')
		}
	}

	return (
		<DropdownMenuItem onClick={handleTheme}>
			{icon}
			<span>{text}</span>
		</DropdownMenuItem>
	)
}

function AuthMenuItems() {
	const { data: session } = useSession()

	if (!session) {
		return <SignUpAndLoginMenuItems />
	}

	return <LogoutMenuItem />
}

function SignUpAndLoginMenuItems() {
	const t = useTranslations()

	return (
		<>
			<DropdownMenuItem>
				<UserPlus />
				<span>{t.components.dropdownMenus.signUp}</span>
			</DropdownMenuItem>
			<DropdownMenuItem>
				<LogIn />
				<span>{t.components.dropdownMenus.login}</span>
			</DropdownMenuItem>
		</>
	)
}

function LogoutMenuItem() {
	const t = useTranslations()
	const handleSignOut = async () => {
		await signOut()
	}
	return (
		<DropdownMenuItem onClick={handleSignOut}>
			<LogOut />
			<span>{t.components.dropdownMenus.logOut}</span>
		</DropdownMenuItem>
	)
}

function StartNewChatMenuItem() {
	const { startNewChat, messages } = chatStore((state) => state)
	const [, setChatId] = useSessionChatId()
	const t = useTranslations()
	const pathname = usePathname()
	const { lang } = useParams()

	if (pathname !== `/${lang as string}` || messages.length === 0) {
		return null
	}

	const handleStartNewChat = () => {
		startNewChat()
		setChatId('')
	}

	return (
		<DropdownMenuItem onClick={handleStartNewChat}>
			<Plus />
			<span>{t.components.dropdownMenus.startNewChat}</span>
		</DropdownMenuItem>
	)
}
