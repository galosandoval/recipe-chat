import { useTranslations } from '~/hooks/use-translations'
import { useThemeCycle } from '~/hooks/use-theme-cycle'
import { Button } from './button'

export const ThemeToggle = () => {
  const t = useTranslations()
  const { icon, cycleTheme } = useThemeCycle()

  return (
    <div className='relative w-full'>
      <Button onClick={cycleTheme} className='w-full justify-between'>
        {t.nav.menu.theme}
        {icon}
      </Button>
    </div>
  )
}
