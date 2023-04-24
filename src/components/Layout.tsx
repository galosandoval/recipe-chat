import { Popover } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'
import { animationOptions } from '../utils/constants'
import { Button } from './Button'
import chefHat from '../assets/chefHat.svg'
import Image from 'next/image'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const menuItems = [
    { label: 'dashboard', value: '/', icon: chefHat },
    { label: 'list', value: '/list', icon: chefHat },
    { label: 'recipes', value: '/recipes', icon: chefHat }
    // { label: 'friends', value: '/friends' },
    // { label: 'account', value: '/account' }
  ]

  const activeLinkStyles = (href: string) => {
    let styles =
      'transition-all duration-150 border dark:group-hover:border-b-white group-hover:border-b-slate-900 py-1 text-xs font-semibold'

    if (router.asPath === href) {
      styles +=
        ' border-b-indigo-500 border-x-white border-t-white dark:border-x-slate-800 dark:border-t-slate-800'
    } else {
      styles += ' border-white dark:border-slate-800'
    }

    return styles
  }

  useEffect(() => {
    const themeDoesNotExists = !('theme' in localStorage)
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    let { theme } = localStorage

    if (themeDoesNotExists && prefersDarkMode) {
      theme = 'dark'
    } else if (themeDoesNotExists && !prefersDarkMode) {
      theme = 'light'
    }

    if (theme === 'light') {
      document.documentElement.classList.remove('dark', 'bg-slate-900')
      document.documentElement.classList.add('bg-gray-50')
    }

    if (theme === 'dark') {
      document.documentElement.classList.remove('bg-gray-50')
      document.documentElement.classList.add('dark', 'bg-slate-900')
    }
  }, [])

  const handleToggleDarkMode = () => {
    const { theme } = localStorage

    if (theme === 'dark') {
      localStorage.theme = 'light'
      document.documentElement.classList.remove('dark', 'bg-slate-900')
      document.documentElement.classList.add('bg-gray-50')
    } else {
      localStorage.theme = 'dark'
      document.documentElement.classList.remove('bg-gray-50')
      document.documentElement.classList.add('dark', 'bg-slate-900')
    }
  }

  return (
    <div className='flex h-screen w-full flex-col-reverse text-slate-900 h-screen-ios dark:text-white md:flex-row'>
      <nav>
        <ul className='flex gap-1 bg-white px-5 py-2 dark:bg-slate-800 md:flex-col'>
          {menuItems.map((item) => (
            <Link
              className='group my-1 flex w-full cursor-default select-none flex-col items-center justify-center text-2xl'
              href={item.value}
              key={item.label}
            >
              <Image alt='icon' src={item.icon} width={20} height={20} />
              <span className={activeLinkStyles(item.value)}>{item.label}</span>
            </Link>
          ))}
          <li className=''>
            <SettingsPopover handleToggleDarkMode={handleToggleDarkMode} />
          </li>
        </ul>
      </nav>
      <main className='h-full w-full overflow-y-auto text-black dark:text-white'>
        {children}
      </main>
    </div>
  )
}

export function SettingsPopover({
  handleToggleDarkMode
}: {
  handleToggleDarkMode: () => void
}) {
  return (
    <div className='w-full max-w-sm px-4'>
      <Popover className='relative'>
        {({ open }) => (
          <>
            <Popover.Button
              className={`
                ${open ? '' : 'text-opacity-90'}
                group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <span>Solutions</span>
            </Popover.Button>

            <AnimatePresence>
              {open && (
                <Popover.Panel
                  className='absolute left-0 z-10 mt-3 max-w-sm -translate-x-1/2 transform px-4 sm:px-0'
                  as={motion.div}
                  {...animationOptions}
                >
                  <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5'>
                    <Button onClick={handleToggleDarkMode}>theme</Button>
                    <Button
                      onClick={() =>
                        signOut({
                          callbackUrl: process.env.VERCEL_URL
                            ? process.env.VERCEL_URL
                            : 'http://localhost:3000/'
                        })
                      }
                    >
                      logout
                    </Button>
                  </div>
                </Popover.Panel>
              )}
            </AnimatePresence>
          </>
        )}
      </Popover>
    </div>
  )
}
