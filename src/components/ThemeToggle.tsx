import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './Icons'
import { themeChange } from 'theme-change'

export const darkTheme = 'night'
export const lightTheme = 'winter'
export type Theme = typeof darkTheme | typeof lightTheme

export function useTheme() {
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

  return { theme, updateTheme }
}

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
    <div className='relative'>
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
