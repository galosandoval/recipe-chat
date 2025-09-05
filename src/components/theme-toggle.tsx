import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations } from '~/hooks/use-translations'
import { Button } from './ui/button'
import { darkTheme, lightTheme } from '~/constants/theme'


export const ThemeToggle = () => {
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const handleToggleTheme = () => {
    if (theme === darkTheme) {
      setTheme(lightTheme)
    } else {
      setTheme(darkTheme)
    }
  }

  return (
    <div className='relative w-full'>
      <Button onClick={handleToggleTheme} className='w-full justify-between'>
        {t.nav.menu.theme}
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  )
}
