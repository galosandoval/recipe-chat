import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from '~/components/toast'
import {
  darkTheme,
  lightTheme,
  systemTheme,
  type Theme
} from '~/constants/theme'
import { useTranslations } from './use-translations'

const nextTheme: Record<Theme, Theme> = {
  [lightTheme]: darkTheme,
  [darkTheme]: systemTheme,
  [systemTheme]: lightTheme
}

const themeIcons: Record<Theme, React.ReactNode> = {
  [lightTheme]: <SunIcon />,
  [darkTheme]: <MoonIcon />,
  [systemTheme]: <MonitorIcon />
}

/**
 * Encapsulates next-themes' three-way theme setting as a single cycle:
 * light → dark → system → light. The icon reflects the *current* setting
 * rather than the next one, and a toast names what it changed to — without it
 * a switch between 'system' and its resolved value looks like a no-op.
 */
export function useThemeCycle() {
  const { theme, setTheme } = useTheme()
  const current = (theme ?? systemTheme) as Theme
  const t = useTranslations()

  const cycleTheme = () => {
    const next = nextTheme[current]
    if (!theme) {
      throw new Error('Theme must be defined to cycle it')
    }
    toast.info(t.nav.menu.replace('themeChanged', theme))
    setTheme(next)
  }

  return {
    theme: current,
    icon: themeIcons[current],
    cycleTheme
  }
}
