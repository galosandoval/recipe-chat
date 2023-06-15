import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './Icons'
import { themeChange } from 'theme-change'

const darkTheme = 'night'
const lightTheme = 'winter'
type Theme = typeof darkTheme | typeof lightTheme

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('night')

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
      setTheme(lightTheme)
    } else {
      localStorage.theme = darkTheme
      document.documentElement.setAttribute('data-theme', darkTheme)
      setTheme(darkTheme)
    }
  }

  useEffect(() => {
    themeChange(false)
    // 👆 false parameter is required for react project
  }, [])

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
