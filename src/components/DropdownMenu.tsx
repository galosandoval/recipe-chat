import { Menu, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { ArrowLeftOnRectangleIcon, MoonIcon, SunIcon } from './Icons'
import { themeChange } from 'theme-change'
import { signOut } from 'next-auth/react'

export function DropdownMenuWithTheme() {
  const [theme, setTheme] = useState<Theme>('night')

  const updateTheme = (theme: Theme) => {
    setTheme(theme)
  }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])
  useEffect(() => {
    const themeDoesNotExist = !('theme' in localStorage)
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    let { theme } = localStorage

    if (themeDoesNotExist && prefersDarkMode) {
      theme = darkTheme
    } else if (themeDoesNotExist && !prefersDarkMode) {
      theme = lightTheme
    }

    if (theme === lightTheme) {
      document.documentElement.setAttribute('data-theme', lightTheme)
      setTheme(lightTheme)
    } else {
      document.documentElement.setAttribute('data-theme', darkTheme)
      setTheme(darkTheme)
    }
  }, [])

  return (
    <Menu as='div' className='relative'>
      <Menu.Button className='btn-ghost btn-circle btn'>
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
      </Menu.Button>
      <Transition
        enter='transition duration-100 ease-out'
        enterFrom='transform scale-95 opacity-0'
        enterTo='transform scale-100 opacity-100'
        leave='transition duration-75 ease-out'
        leaveFrom='transform scale-100 opacity-100'
        leaveTo='transform scale-95 opacity-0'
      >
        <Menu.Items className='absolute right-0 top-[0.5rem] z-20 flex flex-col gap-4 rounded-md bg-primary-content py-2 shadow'>
          <Menu.Item>
            <>
              <ThemeToggle updateTheme={updateTheme} theme={theme} />
            </>
          </Menu.Item>
          <Menu.Item>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='btn-ghost no-animation btn w-[8rem]'
            >
              <span>Logout</span>
              <ArrowLeftOnRectangleIcon />
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

const darkTheme = 'night'
const lightTheme = 'winter'
type Theme = typeof darkTheme | typeof lightTheme

export function ThemeToggle({
  theme,
  updateTheme
}: {
  theme: Theme
  updateTheme: (theme: Theme) => void
}) {
  const handleToggleTheme = () => {
    const { theme } = localStorage

    if (theme === darkTheme) {
      localStorage.theme = lightTheme
      document.documentElement.setAttribute('data-theme', lightTheme)
      updateTheme(lightTheme)
    } else {
      localStorage.theme = darkTheme
      document.documentElement.setAttribute('data-theme', darkTheme)
      updateTheme(darkTheme)
    }
  }

  return (
    <div className='relative text-base-content'>
      <button
        onClick={handleToggleTheme}
        className='btn-ghost no-animation btn w-[8rem]'
      >
        <span>Theme</span>
        {theme === 'night' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
