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
import { themeChange } from 'theme-change'
import sun from '../assets/sun.svg'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const menuItems = [
    { label: 'dashboard', value: '/', icon: chefHat },
    { label: 'list', value: '/list', icon: chefHat },
    { label: 'recipes', value: '/recipes', icon: chefHat }
    // { label: 'friends', value: '/friends' },
    // { label: 'account', value: '/account' }
  ]
  const darkTheme = 'night'
  const lightTheme = 'winter'

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

  // useEffect(() => {
  //   const themeDoesNotExists = !('theme' in localStorage)
  //   const prefersDarkMode = window.matchMedia(
  //     '(prefers-color-scheme: dark)'
  //   ).matches
  //   let { theme } = localStorage

  //   if (themeDoesNotExists && prefersDarkMode) {
  //     theme = darkTheme
  //   } else if (themeDoesNotExists && !prefersDarkMode) {
  //     theme = lightTheme
  //   }

  //   if (theme === lightTheme) {
  //     document.documentElement.classList.remove(darkTheme)
  //     // document.documentElement.classList.remove(darkTheme, 'bg-slate-900')
  //     document.documentElement.classList.add(lightTheme)
  //   }

  //   if (theme === darkTheme) {
  //     document.documentElement.classList.remove(lightTheme)
  //     document.documentElement.classList.add(darkTheme)
  //   }
  // }, [])

  // const handleToggleDarkMode = () => {
  //   const { theme } = localStorage

  //   if (theme === darkTheme) {
  //     localStorage.theme = lightTheme
  //     document.documentElement.classList.remove(darkTheme)
  //     document.documentElement.classList.add(lightTheme)
  //   } else {
  //     localStorage.theme = darkTheme
  //     document.documentElement.classList.remove(lightTheme)
  //     document.documentElement.classList.add(darkTheme)
  //   }
  // }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

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
            {/* <SettingsPopover handleToggleDarkMode={handleToggleDarkMode} /> */}

            <label className='swap-rotate swap'>
              <input type='checkbox' />

              <label className='swap-rotate swap'>
                <input type='checkbox' />

                <svg
                  className='swap-on h-9 w-9 fill-current'
                  xmlns='http://www.w3.org/2000/svg'
                  data-set-theme='night'
                  data-act-class='ACTIVECLASS'
                  viewBox='0 0 24 24'
                >
                  <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
                </svg>

                <svg
                  className='swap-off h-9 w-9 fill-current'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  data-set-theme='winter'
                  data-act-class='ACTIVECLASS'
                >
                  <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
                </svg>
              </label>
            </label>
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
