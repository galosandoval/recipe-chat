import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'
import { ChatsDrawer } from '../chats-drawer'
import { chatStore } from '~/stores/chat-store'
import { LoginDrawerDialog, SignUpDrawerDialog } from '../auth/auth-modals'
import { DropdownMenu, type MenuItemProps } from '../dropdown-menu'
import {
  HistoryIcon,
  KeyRoundIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SettingsIcon,
  SunIcon,
  UserPlusIcon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { darkTheme, lightTheme } from '~/constants/theme'
import { useState } from 'react'

export function NavDropdownMenu() {
  const t = useTranslations()
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isChatsOpen, setIsChatsOpen] = useState(false)
  const { chatId } = chatStore()
  const pathname = usePathname()
  console.log('chatId', chatId)
  console.log('pathname', pathname)
  const session = useSession()

  const handleToggleSignUp = () => {
    setIsSignUpOpen((state) => !state)
  }
  const handleToggleLogin = () => {
    setIsLoginOpen((state) => !state)
  }
  const handleToggleDrawer = () => {
    setIsChatsOpen((state) => !state)
  }

  const items = [
    useThemeToggleMenuItem(),
    useStartNewChatMenuItem(),
    useLogoutMenuItem()
  ]

  if (!session.data) {
    items.push(
      {
        slot: (
          <span onClick={handleToggleLogin}>
            <KeyRoundIcon />
            {t.nav.menu.login}
          </span>
        )
      },
      {
        slot: (
          <span onClick={handleToggleSignUp}>
            <UserPlusIcon />
            {t.nav.menu.signUp}
          </span>
        )
      }
    )
  }
  if (!chatId && pathname.includes('chat')) {
    items.push({
      slot: (
        <span onClick={handleToggleDrawer}>
          <HistoryIcon />
          {t.nav.menu.chats}
        </span>
      )
    })
  }

  return (
    <>
      <DropdownMenu
        trigger={<SettingsIcon />}
        items={items}
        title={t.nav.settings}
      />
      <SignUpDrawerDialog
        open={isSignUpOpen}
        onOpenChange={handleToggleSignUp}
      />
      <LoginDrawerDialog open={isLoginOpen} onOpenChange={handleToggleLogin} />
      <ChatsDrawer open={isChatsOpen} onOpenChange={handleToggleDrawer} />
    </>
  )
}

function buildMenuItem(item: MenuItemProps) {
  if ('slot' in item) {
    return {
      slot: item.slot
    }
  }
  return {
    label: item?.label,
    icon: item?.icon,
    onClick: item?.onClick
  }
}

function useThemeToggleMenuItem() {
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

function useLogoutMenuItem() {
  const { setChatId } = chatStore()
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

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

function useStartNewChatMenuItem() {
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
