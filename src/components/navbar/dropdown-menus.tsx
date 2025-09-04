import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { useChatsDrawer } from '../chats-drawer'
import { chatStore } from '~/stores/chat-store'
import { useAuthModal } from '../auth/auth-modals'
import { DropdownMenu, type MenuItemProps } from '../dropdown-menu'
import {
  ListCheck,
  LogOutIcon,
  Moon,
  Plus,
  Settings,
  SquareArrowOutUpLeft,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'

export function NavDropdownMenu() {
  const t = useTranslations()
  const items = [
    loginMenuItem(),
    themeToggleMenuItem(),
    logoutMenuItem(),
    // separator
    startNewChatMenuItem(),
    chatsSideBarMenuItem()
  ]
  return (
    <DropdownMenu trigger={<Settings />} items={items} title={t.nav.settings} />
  )
}

function buildMenuItem(item: MenuItemProps) {
  return {
    label: item.label,
    icon: item.icon,
    onClick: item.onClick
  }
}

function loginMenuItem() {
  const { handleOpenLogin } = useAuthModal()
  const { data: session } = useSession()
  if (session) return null

  return buildMenuItem({
    label: 'nav.menu.login',
    icon: <LogOutIcon />,
    onClick: handleOpenLogin
  })
}
export const darkTheme = 'dark'
export const lightTheme = 'light'

function themeToggleMenuItem() {
  const { theme, setTheme } = useTheme()
  const handleToggleTheme = () => {
    if (theme === darkTheme) {
      setTheme(lightTheme)
    } else {
      setTheme(darkTheme)
    }
  }

  return buildMenuItem({
    label: 'nav.menu.theme',
    icon: theme === darkTheme ? <Sun /> : <Moon />,
    onClick: handleToggleTheme
  })
}

function logoutMenuItem() {
  const { setChatId } = chatStore()
  const t = useTranslations()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: pathname })

    setChatId('')
  }

  return buildMenuItem({
    label: 'nav.menu.logout',
    icon: <SquareArrowOutUpLeft />,
    onClick: handleSignOut
  })
}

function startNewChatMenuItem() {
  const t = useTranslations()
  const { setChatId } = chatStore()
  const pathname = usePathname()
  const { setStream, setStreamingStatus, setMessages, messages } = chatStore()

  const handleStartNewChat = () => {
    setChatId('')
    setStream({ content: '', recipes: [] })
    setStreamingStatus('idle')
    setMessages([])
  }

  // Only show if there's an actual chat ID (not empty string or undefined)
  const isInChat = pathname.includes('chat')
  if (!isInChat || (messages.length === 0 && isInChat)) return null

  return buildMenuItem({
    label: 'nav.menu.startNewChat',
    icon: <Plus />,
    onClick: handleStartNewChat
  })
}

function chatsSideBarMenuItem() {
  const { chatId } = chatStore()
  const pathname = usePathname()
  const { handleToggleDrawer } = useChatsDrawer()

  // Only show if there's an actual chat ID (not empty string or undefined)
  if (!chatId || !pathname.includes('chat')) return null

  return buildMenuItem({
    label: 'nav.menu.chats',
    icon: <ListCheck />,
    onClick: handleToggleDrawer
  })
}
