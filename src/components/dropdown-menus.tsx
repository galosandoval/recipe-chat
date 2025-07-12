import {
  Menu,
  Transition,
  MenuItem,
  MenuButton,
  MenuItems
} from '@headlessui/react'
import { ThemeToggle, useTheme } from './theme-toggle'
import { ArrowLeftOnRectangleIcon } from './icons'
import { signOut } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { usePathname } from 'next/navigation'

function DropdownMenu({ children }: { children: React.ReactNode }) {
  return (
    <Menu as='div' className='relative'>
      <MenuButton className='btn btn-circle btn-ghost'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-6 w-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
          />
        </svg>
      </MenuButton>
      <Transition
        enter='transition duration-100 ease-out'
        enterFrom='transform scale-95 opacity-0'
        enterTo='transform scale-100 opacity-100'
        leave='transition duration-75 ease-out'
        leaveFrom='transform scale-100 opacity-100'
        leaveTo='transform scale-95 opacity-0'
      >
        <MenuItems className='absolute right-0 top-[0.5rem] z-20 flex flex-col gap-1 rounded-md bg-primary-content shadow'>
          {children}
        </MenuItems>
      </Transition>
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
