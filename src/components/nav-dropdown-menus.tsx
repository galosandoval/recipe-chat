import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react'
import { ThemeToggle, useTheme } from './theme-toggle'
import {
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  PlusIcon
} from './icons'
import { signOut } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { useChatsDrawer } from './chats-drawer'
import { chatStore } from '~/stores/chat-store'
import { useAuthModal } from './auth/auth-modals'

export function NavDropdownMenu() {
  const { theme, updateTheme } = useTheme()

  return (
    <DropdownMenu>
      <Login />
      <MenuItem>
        <ThemeToggle showLabel updateTheme={updateTheme} theme={theme} />
      </MenuItem>
      <Logout />
      <StartNewChat />
      <ChatsSideBarButton />
    </DropdownMenu>
  )
}

function Login() {
  const t = useTranslations()
  const { handleOpenLogin } = useAuthModal()
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

function Logout() {
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

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu>
      <MenuButton className='btn btn-circle btn-ghost'>
        <Cog6ToothIcon />
      </MenuButton>
      <MenuItems
        anchor='bottom'
        transition
        className='bg-base-100 z-50 flex origin-top flex-col rounded-md transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0'
      >
        {children}
      </MenuItems>
    </Menu>
  )
}

function StartNewChat() {
  const t = useTranslations()
  const { chatId, setChatId } = chatStore()
  const pathname = usePathname()
  const { setStream, setStreamingStatus, setMessages } = chatStore()

  const handleStartNewChat = () => {
    setChatId('')
    setStream({ content: '', recipes: [] })
    setStreamingStatus('idle')
    setMessages([])
  }

  // Only show if there's an actual chat ID (not empty string or undefined)
  if (!chatId || !pathname.includes('chat')) return null

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

function ChatsSideBarButton() {
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

