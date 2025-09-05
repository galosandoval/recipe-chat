import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { useChatsDrawer } from '../chats-drawer'
import { chatStore } from '~/stores/chat-store'
import { useAuthModal } from '../auth/auth-modals'
import { DropdownMenu, type MenuItemProps } from '../dropdown-menu'
import {
  KeyRoundIcon,
  ListCheck,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { darkTheme, lightTheme } from '~/constants/theme'

export function NavDropdownMenu() {
  const t = useTranslations()
  const items = [
    loginMenuItem(),
    themeToggleMenuItem(),
    logoutMenuItem(),
    startNewChatMenuItem(),
    chatsSideBarMenuItem()
  ]
  return (
    <DropdownMenu
      trigger={<SettingsIcon />}
      items={items}
      title={t.nav.settings}
    />
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
    icon: <KeyRoundIcon />,
    onClick: handleOpenLogin
  })
}

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
    icon: theme === darkTheme ? <SunIcon /> : <MoonIcon />,
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
    icon: <LogOutIcon />,
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
    icon: <PlusIcon />,
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
