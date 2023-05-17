import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { themeChange } from 'theme-change'
import { BackChevron, ChefHat, Pencil } from 'assets/NavBarIcons'

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

  const controlNavbar = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (lastScrollY > 10 && window.scrollY > lastScrollY) {
        // if scroll down hide the navbar
        setIsOpen('-translate-y-full')
      } else {
        setIsOpen('')
      }
      // remember current page location to use in the next move
      setLastScrollY(window.scrollY)
    }
  }, [lastScrollY])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [controlNavbar])

  let outerDivClass = ''
  if (router.asPath === '/') {
    outerDivClass = 'h-screen-ios h-screen'
  }

  return (
    <div className={outerDivClass}>
      <div
        className={`backdrop sticky top-0 z-10 flex w-full justify-center bg-gradient-to-b from-base-100 to-base-100/80 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300 ${isOpen}`}
      >
        {navbar}
      </div>
      <main className='container relative z-0'>{children}</main>
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
        <BackChevron />
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
        <Pencil />
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
        Cancel
      </button>
      <h1 className='mb-0 text-base'>Edit Recipe</h1>
    </nav>
  )
}

function PagesNavbar() {
  const router = useRouter()
  const [theme, setTheme] = useState<Theme>('night')
  const menuItems = [
    { label: 'dashboard', value: '/', icon: <ChefHat /> },
    { label: 'list', value: '/list', icon: <ChefHat /> },
    { label: 'recipes', value: '/recipes', icon: <ChefHat /> }
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
      <div className='relative grid place-items-center text-base-content'>
        <label className='swap-rotate swap'>
          <input type='checkbox' />
          <svg
            className={`${
              theme === 'night' ? 'swap-on' : 'swap-off'
            } h-8 w-8 fill-current`}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            onClick={handleToggleTheme}
          >
            <path d='M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z' />
          </svg>
          <svg
            className={`${
              theme === 'winter' ? 'swap-on' : 'swap-off'
            } h-8 w-8 fill-current`}
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            onClick={handleToggleTheme}
          >
            <path d='M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z' />
          </svg>
        </label>
      </div>
    </nav>
  )
}
