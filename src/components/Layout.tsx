import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import { themeChange } from 'theme-change'
import {
  BackChevron,
  ChefHat,
  MenuDots,
  MoonSVG,
  SunSVG
} from 'assets/NavBarIcons'

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
  console.log('router.atPat', router.pathname)

  let navbar = <PagesNavbar />

  if (router.pathname === '/recipes/[id]') {
    navbar = <RecipeByIdNavbar />
  }

  return (
    <div>
      <div className='backdrop sticky top-0 z-30 flex w-full justify-center bg-gradient-to-b from-base-100 to-base-100/80 text-base-content bg-blend-saturation backdrop-blur transition-all duration-100 '>
        {navbar}
      </div>
      <main className='container relative z-0'>{children}</main>
    </div>
  )
}

function RecipeByIdNavbar() {
  const router = useRouter()
  return (
    <nav className='navbar prose w-full gap-3 bg-transparent px-4'>
      {/* <div className='flex items-center justify-center gap-1'> */}
      <button onClick={() => router.push('/recipes')}>
        <BackChevron />
      </button>
      <h1 className='mb-0 text-base'>{router.query.name}</h1>
      <button className=''>
        <MenuDots />
      </button>
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
    let styles = 'absolute -bottom-[0.65rem] h-1 w-full bg-transparent'

    if (router.asPath === path) {
      styles = 'absolute -bottom-[0.65rem] h-1 w-full bg-primary'
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
          <SunSVG handleToggleTheme={handleToggleTheme} theme={theme} />
          <MoonSVG handleToggleTheme={handleToggleTheme} theme={theme} />
        </label>
      </div>
    </nav>
  )
}
