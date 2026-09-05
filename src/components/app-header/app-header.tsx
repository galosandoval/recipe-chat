'use client'

import { usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './settings-dropdown-menu'
import { ArrowBigLeft, PencilIcon } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import { useRecipeEditStore } from '~/app/recipes/[slug]/recipe-edit-store'
import { useAppRouter } from '~/hooks/use-app-router'
import { ChatHistoryButton } from './chat-history-button'
import {
  ACTIVE_NAV_ITEM_CLASSES,
  CHAT_HISTORY_PATH,
  isNavItemCurrent,
  NAV_ITEMS,
  useNavChromeVisible
} from './nav-shell'

export const AppHeader = () => {
  const pathname = usePathname()
  const slug = useRecipeSlug()
  const hasSidebar = useNavChromeVisible()

  if (pathname === `/recipes/${slug}`) {
    return <RecipeByIdNavbar />
  }

  const isChatHistory = pathname === CHAT_HISTORY_PATH

  return (
    // At `md+` the sidebar carries the app name, sections, history, and
    // settings, so the pill header has nothing left to hold — it drops out
    // rather than floating a lost title across a wide viewport. Only when
    // there is a sidebar to replace it, though: a signed-out visitor has no
    // sidebar, so the header stays and keeps the settings menu reachable.
    // Chat History keeps its back bar at every width, flush and full-width
    // once there is a sidebar beside it.
    <header
      className={cn(
        'sticky top-0 z-30',
        hasSidebar && !isChatHistory && 'md:hidden'
      )}
    >
      <div className='w-full'>
        <div className='mx-auto flex w-full max-w-2xl justify-center sm:pt-3 md:max-w-none md:pt-0'>
          <div className='glass-element from-background to-background/30 text-foreground border-muted-foreground/20 w-full border-b bg-gradient-to-b sm:rounded-md sm:border md:rounded-none md:border-x-0 md:border-t-0'>
            {isChatHistory ? <ChatHistoryHeader /> : <ChatHeader />}
          </div>
        </div>
      </div>
    </header>
  )
}

export const BottomNav = () => {
  const isVisible = useNavChromeVisible()

  if (!isVisible) {
    return null
  }

  return (
    <div className='w-full md:hidden'>
      <div className='mx-auto flex w-full max-w-2xl justify-center sm:pb-3'>
        <div className='glass-element from-background/30 to-background text-foreground border-muted-foreground/20 w-full border-t bg-gradient-to-t sm:rounded-md sm:border'>
          <BottomNavTabs />
        </div>
      </div>
    </div>
  )
}

function ChatHeader() {
  const t = useTranslations()

  return (
    <nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4 py-1'>
      <div className='justify-self-start'>
        <NavDropdownMenu />
      </div>
      <h1 className='text-base'>{t.nav.appName}</h1>
      <div className='justify-self-end'>
        <ChatHistoryButton />
      </div>
    </nav>
  )
}

/**
 * Chat History's own header: a back arrow in the app header's left slot, the
 * same affordance the Recipe detail page uses to leave a drilled-into screen.
 */
function ChatHistoryHeader() {
  const t = useTranslations()
  const router = useRouter()

  return (
    <nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4 py-1'>
      <div className='justify-self-start'>
        <Button
          variant='ghost'
          size='icon'
          aria-label={t.common.back}
          onClick={() => router.back()}
        >
          <ArrowBigLeft />
        </Button>
      </div>
      <h1 className='text-base'>{t.chat.history.title}</h1>
      <div />
    </nav>
  )
}

/**
 * The Recipe detail's own header. Stays a `<header>` like the app header so it
 * exposes the same `banner` landmark — a `<nav>` here would hide the back and
 * edit controls from anything scoping to the banner.
 */
function RecipeByIdNavbar() {
  const router = useAppRouter()
  return (
    <header>
      <div className='absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-2xl flex-1 justify-between bg-transparent p-3'>
        <Button
          variant='outline'
          className='glass-background'
          onClick={() => router.push('/recipes')}
          size='icon'
        >
          <ArrowBigLeft />
        </Button>

        <RecipeByIdEditButton />
      </div>
    </header>
  )
}

/**
 * The Recipe detail's edit affordance (issue #563): the former options-menu
 * ellipsis is now a plain Edit icon that flips the shared edit-mode flag. While
 * editing it hides — the edit form's Cancel/Save FABs and Delete button take
 * over, so the navbar doesn't duplicate those actions.
 */
function RecipeByIdEditButton() {
  const t = useTranslations()
  const isEditing = useRecipeEditStore((s) => s.isEditing)
  const setIsEditing = useRecipeEditStore((s) => s.setIsEditing)

  if (isEditing) return null

  return (
    <Button
      variant='outline'
      className='glass-background'
      size='icon'
      aria-label={t.recipes.byId.edit}
      onClick={() => setIsEditing(true)}
    >
      <PencilIcon />
    </Button>
  )
}

function BottomNavTabs() {
  const pathname = usePathname()
  const t = useTranslations()
  return (
    <nav className='mx-auto flex w-full justify-between gap-2 overflow-hidden px-3 py-1'>
      {NAV_ITEMS.map(({ value, Icon, label }) => {
        const isCurrent = isNavItemCurrent(pathname, value)

        return (
          <NavigationButton
            href={value}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'text-card-foreground/75 active:bg-accent hover:bg-accent hover:text-accent-foreground/75 flex h-10 flex-1 items-center justify-center rounded-md px-1 py-1 transition-colors duration-75 active:scale-[99%] [&_svg]:size-5',
              isCurrent && ACTIVE_NAV_ITEM_CLASSES
            )}
            as={Button}
            variant='ghost'
            key={value}
          >
            <Icon />
            <span className='text-xs'>{t.nav[label]}</span>
          </NavigationButton>
        )
      })}
    </nav>
  )
}
