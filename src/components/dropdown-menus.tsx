import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react'
import { ThemeToggle, useTheme } from './theme-toggle'
import { ArrowLeftOnRectangleIcon, VerticalEllipsisIcon } from './icons'
import { signOut } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'

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

export function ProtectedDropdownMenu() {
  const t = useTranslations()
  const { theme, updateTheme } = useTheme()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: pathname })

    sessionStorage.removeItem('currentChatId')
  }

  return (
    <DropdownMenu>
      <MenuItem>
        <ThemeToggle showLabel updateTheme={updateTheme} theme={theme} />
      </MenuItem>
      <MenuItem>
        <button
          onClick={handleSignOut}
          className='btn btn-ghost no-animation w-[8rem]'
        >
          <span>{t.nav.menu.logout}</span>
          <ArrowLeftOnRectangleIcon />
        </button>
      </MenuItem>
    </DropdownMenu>
  )
}
