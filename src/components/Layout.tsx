import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'
import { Button } from './Button'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { status } = useSession()

  const menuItems = [
    { label: 'dashboard', value: '/' },
    { label: 'lists', value: '/lists' },
    { label: 'recipes', value: '/recipes' },
    { label: 'friends', value: '/friends' },
    { label: 'account', value: '/account' }
  ]

  const activeLinkStyles = (href: string) => {
    let styles =
      'transition-all duration-150 border dark:group-hover:border-b-white group-hover:border-b-slate-900 py-1'

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
      document.documentElement.classList.remove('dark')
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const { theme } = localStorage

    if (theme === 'dark') {
      localStorage.theme = 'light'
      document.documentElement.classList.remove('dark')
    } else {
      localStorage.theme = 'dark'
      document.documentElement.classList.add('dark')
    }
  }

  return (
    <div className='bg-app flex text-slate-900 dark:text-white'>
      <ul className='flex flex-col bg-white px-5 pt-10 dark:bg-slate-800'>
        {menuItems.map((item) => (
          <Link href={item.value} key={item.label}>
            <li className='group my-1 w-full cursor-default select-none text-2xl'>
              <span className={activeLinkStyles(item.value)}>{item.label}</span>
            </li>
          </Link>
        ))}
        <Button onClick={toggleDarkMode}>theme</Button>
      </ul>
      <main className='min-h-screen w-full text-black dark:text-white'>
        {children}
      </main>
    </div>
  )
}
