import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'

function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

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
    <div className='flex bg-app text-slate-900 dark:text-white'>
      <ul className='flex flex-col bg-white dark:bg-slate-800 px-5 pt-10'>
        {menuItems.map((item) => (
          <Link href={item.value} key={item.label}>
            <li className='text-2xl cursor-auto select-none w-full group my-1'>
              <span className={activeLinkStyles(item.value)}>{item.label}</span>
            </li>
          </Link>
        ))}
        <button
          className='text-2xl text-white w-full text-left bg-indigo-500 hover:bg-indigo-400 active:scale-95 rounded mt-1 px-2 py-1'
          onClick={toggleDarkMode}
        >
          theme
        </button>
      </ul>
      <div className='w-full'>{children}</div>
    </div>
  )
}

export default Layout
