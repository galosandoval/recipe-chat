import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react'
import { ThemeToggle, useTheme } from './theme-toggle'
import {
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  VerticalEllipsisIcon
} from './icons'
import { signOut } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { useChatId } from '~/hooks/use-session-chat-id'

export function NavDropdownMenu() {
  const { theme, updateTheme } = useTheme()

  return (
    <DropdownMenu>
      <MenuItem>
        <ThemeToggle showLabel updateTheme={updateTheme} theme={theme} />
      </MenuItem>
      <Logout />
      <StartNewChat />
    </DropdownMenu>
  )
}

function Logout() {
  const [, setChatId] = useChatId()
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
        className='btn btn-ghost no-animation w-[8rem]'
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
        <VerticalEllipsisIcon />
      </MenuButton>
      <MenuItems
        anchor='bottom'
        transition
        className='bg-base-100 z-50 origin-top rounded-md transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0'
      >
        {children}
      </MenuItems>
    </Menu>
  )
}

function StartNewChat() {
  const t = useTranslations()
  const [chatId, setChatId] = useChatId()
  console.log('chatId', chatId)
  const handleStartNewChat = () => {
    setChatId('')
  }

  // Only show if there's an actual chat ID (not empty string or undefined)
  if (!chatId) return null

  return (
    <MenuItem>
      <button
        onClick={handleStartNewChat}
        className='btn btn-ghost no-animation w-[8rem]'
      >
        <span>{t.nav.menu.startNewChat}</span>
        <PlusIcon />
      </button>
    </MenuItem>
  )
}
