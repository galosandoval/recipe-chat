import { MenuItem } from '@headlessui/react'
import {
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  PlusIcon
} from '../icons'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { useChatsDrawer } from '../chats-drawer'
import { chatStore } from '~/stores/chat-store'
import { useAuthModal } from '../auth/auth-modals'
import { DropdownMenu } from '../dropdown-menu'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../theme-toggle'

export function NavDropdownMenu() {
  return (
    <DropdownMenu icon={<Cog6ToothIcon />}>
      <LoginMenuItem />
      <ThemeToggleMenuItem />
      <LogoutMenuItem />
      <StartNewChatMenuItem />
      <ChatsSideBarMenuItem />
    </DropdownMenu>
  )
}

function LoginMenuItem() {
  const t = useTranslations()
  const { handleOpenLogin } = useAuthModal()
  const { data: session } = useSession()
  if (session) return null
  return (
    <MenuItem>
      <button
        className='btn btn-ghost w-[8rem] justify-between'
        onClick={handleOpenLogin}
      >
        <span>{t.nav.menu.login}</span>
        <ArrowLeftOnRectangleIcon />
      </button>
    </MenuItem>
  )
}

function ThemeToggleMenuItem() {
  const { theme, setTheme } = useTheme()
  return (
    <MenuItem>
      <ThemeToggle />
    </MenuItem>
  )
}

function LogoutMenuItem() {
  const { setChatId } = chatStore()
  const t = useTranslations()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: pathname })

    setChatId('')
  }

  return (
    <MenuItem>
      <button
        onClick={handleSignOut}
        className='btn btn-ghost w-[8rem] justify-between'
      >
        <span>{t.nav.menu.logout}</span>
        <ArrowLeftOnRectangleIcon />
      </button>
    </MenuItem>
  )
}

function StartNewChatMenuItem() {
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

  return (
    <MenuItem>
      <button
        onClick={handleStartNewChat}
        className='btn btn-ghost w-[8rem] justify-between'
      >
        <span>{t.nav.menu.startNewChat}</span>
        <PlusIcon />
      </button>
    </MenuItem>
  )
}

function ChatsSideBarMenuItem() {
  const t = useTranslations()
  const { chatId } = chatStore()
  const pathname = usePathname()
  const { handleToggleDrawer } = useChatsDrawer()

  // Only show if there's an actual chat ID (not empty string or undefined)
  if (!chatId || !pathname.includes('chat')) return null

  return (
    <MenuItem>
      <button
        onClick={handleToggleDrawer}
        className='btn btn-ghost w-[8rem] justify-between'
      >
        <span>{t.nav.menu.chats}</span>
        <ListBulletIcon />
      </button>
    </MenuItem>
  )
}
