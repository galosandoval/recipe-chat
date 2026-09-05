'use client'

import { usePathname } from 'next/navigation'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { ChatHistoryButton } from './chat-history-button'
import {
  ACTIVE_NAV_ITEM_CLASSES,
  isNavItemCurrent,
  NAV_ITEMS,
  useNavChromeVisible
} from './nav-shell'
import { NavDropdownMenu } from './settings-dropdown-menu'

/**
 * The `md+` app shell nav: the three sections, chat history, and the settings
 * menu in a persistent left rail. Below `md` it is absent and the bottom tab
 * bar owns navigation, so the two never render at once. Visibility follows the
 * bottom bar's rules — signed in, and not on a chrome-free screen.
 */
export function SidebarNav() {
  const pathname = usePathname()
  const isVisible = useNavChromeVisible()
  const t = useTranslations()

  if (!isVisible) {
    return null
  }

  return (
    <aside className='border-muted-foreground/20 bg-background hidden w-56 shrink-0 flex-col border-r md:flex'>
      <div className='px-5 py-4'>
        <h1 className='text-base font-semibold'>{t.nav.appName}</h1>
      </div>

      <nav className='flex flex-col gap-1 px-3'>
        {NAV_ITEMS.map(({ value, Icon, label }) => {
          const isCurrent = isNavItemCurrent(pathname, value)

          return (
            <NavigationButton
              key={value}
              href={value}
              aria-current={isCurrent ? 'page' : undefined}
              as={Button}
              variant='ghost'
              className={cn(
                'text-card-foreground/75 hover:bg-accent hover:text-accent-foreground/75 h-10 w-full justify-start gap-3 transition-colors duration-75 [&_svg]:size-5',
                isCurrent && ACTIVE_NAV_ITEM_CLASSES
              )}
            >
              <Icon />
              <span className='text-sm'>{t.nav[label]}</span>
            </NavigationButton>
          )
        })}
      </nav>

      <div className='mt-auto flex flex-col items-start gap-1 px-3 pb-4'>
        <ChatHistoryButton showLabel />
        <NavDropdownMenu showLabel />
      </div>
    </aside>
  )
}
