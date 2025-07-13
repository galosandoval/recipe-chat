import { forwardRef, useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from './icons'
import { themeChange } from 'theme-change'
import { useTranslations } from '~/hooks/use-translations'

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

type ThemeToggleProps = {
  theme: Theme
  showLabel?: boolean
  updateTheme: (theme: Theme) => void
}

// eslint-disable-next-line react/display-name
export const ThemeToggle = forwardRef<HTMLDivElement, ThemeToggleProps>(
  ({ theme, updateTheme, showLabel }: ThemeToggleProps, ref) => {
    const t = useTranslations()

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
      <div className='relative w-full' ref={ref}>
        <button
          onClick={handleToggleTheme}
          className='btn btn-ghost no-animation w-full'
        >
          {showLabel ? t.nav.menu.theme : null}
          {theme === 'night' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    )
  }
)
