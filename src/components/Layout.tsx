import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { themeChange } from 'theme-change'
import {
  ChatBubbleLeftRightIcon,
  EditIcon,
  XIcon,
  ListBulletIcon
} from './Icons'

const darkTheme = 'night'
const lightTheme = 'winter'
type Theme = typeof darkTheme | typeof lightTheme

export default function Layout({ children }: { children: ReactNode }) {
  const { status } = useSession()

  if (status === 'authenticated') {
    return <RootLayout>{children}</RootLayout>
  }
  return <>{children}</>
}

function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [lastScrollY, setLastScrollY] = useState(0)
  const [isOpen, setIsOpen] = useState('')

  let navbar = <PagesNavbar />

  if (router.pathname === '/recipes/[id]') {
    navbar = <RecipeByIdNavbar />
  } else if (router.pathname === '/recipes/[id]/edit') {
    navbar = <EditRecipeNavbar />
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const controlNavbar = () => {
        if (lastScrollY > 10 && window.scrollY > lastScrollY) {
          // if scroll down hide the navbar
          setIsOpen('-translate-y-full')
        } else {
          setIsOpen('')
        }
        // remember current page location to use in the next move
        setLastScrollY(window.scrollY)
      }

      window.addEventListener('scroll', controlNavbar)

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  return (
    <div>
      <div
        className={`backdrop sticky top-0 z-10 flex w-full justify-center bg-gradient-to-b from-base-100 to-base-100/80 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300 ${isOpen}`}
      >
        {navbar}
      </div>
      <main className='container relative z-0 mx-auto'>{children}</main>
    </div>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose w-full justify-between gap-3 bg-transparent px-4'>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() => router.push('/recipes')}
      >
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
            d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'
          />
        </svg>
      </button>
      <h1 className='mb-0 text-base'>{router.query.name}</h1>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() =>
          router.push(
            `/recipes/${router.query.id}/edit?name=${router.query.name}`
          )
        }
      >
        <EditIcon />
      </button>
    </nav>
  )
}

function EditRecipeNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose w-full gap-24 bg-transparent px-4'>
      <button
        className='btn-ghost btn-circle btn'
        onClick={() => router.back()}
      >
        <XIcon />
      </button>
      <h1 className='mb-0 text-base'>Edit Recipe</h1>
    </nav>
  )
}

function PagesNavbar() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('night')
  const menuItems = [
    {
      label: 'Chat',
      value: '/',
      icon: <ChatBubbleLeftRightIcon />
    },
    {
      label: 'List',
      value: '/list',
      icon: <ListBulletIcon />
    },
    {
      label: 'Recipes',
      value: '/recipes',
      icon: (
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
            d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
          />
        </svg>
      )
    }
  ]

  const activeLinkStyles = (path: string) => {
    let styles =
      'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-base-content'

    if (router.asPath === path) {
      styles =
        'relative flex w-20 flex-col items-center gap-1 text-xs font-semibold text-primary'
    }

    return styles
  }

  const activeSpanStyles = (path: string) => {
    let styles = 'absolute top-[3.12rem] h-1 w-full bg-transparent'

    if (router.asPath === path) {
      styles = 'absolute top-[3.12rem] h-1 w-full bg-primary'
    }

    return styles
  }

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

  const handleToggleTheme = () => {
    const { theme } = localStorage

    if (theme === darkTheme) {
      localStorage.theme = lightTheme
      document.documentElement.setAttribute('data-theme', lightTheme)
    } else {
      localStorage.theme = darkTheme
      document.documentElement.setAttribute('data-theme', darkTheme)
    }
  }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

  return (
    <nav className='navbar w-full justify-between px-5'>
      {menuItems.map((item) => (
        <Link
          className={activeLinkStyles(item.value)}
          href={item.value}
          key={item.label}
        >
          <span className={activeSpanStyles(item.value)}></span>
          {item.icon}
          <span className=''>{item.label}</span>
        </Link>
      ))}
      <div className='relative mb-4 text-base-content'>
        <label className='swap-rotate swap'>
          <input type='checkbox' />
          {/* sun */}

          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            onClick={handleToggleTheme}
            stroke='currentColor'
            className={`${
              theme === 'night' ? 'swap-on' : 'swap-off'
            } h-6 w-6 fill-current`}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z'
            />
          </svg>

          {/* moon */}
          {/* <svg
            className={`${
              theme === 'winter' ? 'swap-on' : 'swap-off'
            } h-8 w-8 fill-current`}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            onClick={handleToggleTheme}
          >
            <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
          </svg> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            onClick={handleToggleTheme}
            stroke='currentColor'
            className={`${
              theme === 'winter' ? 'swap-on' : 'swap-off'
            } h-6 w-6 fill-current`}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z'
            />
          </svg>
        </label>
      </div>
    </nav>
  )
}
