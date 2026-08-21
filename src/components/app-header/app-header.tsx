'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { NavDropdownMenu } from './settings-dropdown-menu'
import {
  ArrowBigLeft,
  CookingPotIcon,
  HistoryIcon,
  LibraryBigIcon,
  MessageSquareIcon,
  PencilIcon
} from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'
import { Button } from '~/components/button'
import { NavigationButton } from '~/components/navigation-button'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import { useRecipeEditStore } from '~/app/recipes/[slug]/recipe-edit-store'
import { useAppRouter } from '~/hooks/use-app-router'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import {
  chatContextToScope,
  chatScopeToSearchParams
} from '~/schemas/chats-schema'

/** The Chat History route, which swaps the app header for a back header. */
const CHAT_HISTORY_PATH = '/chat/history'

export const AppHeader = () => {
  const pathname = usePathname()
  const slug = useRecipeSlug()

  if (pathname === `/recipes/${slug}`) {
    return <RecipeByIdNavbar />
  }

  const isChatHistory = pathname === CHAT_HISTORY_PATH

  return (
    // The default chat header is redundant at `md+` once the sidebar owns the
    // nav, settings, and history affordances, so it drops away there. The chat
    // history back-header stays, but goes full-width instead of a centered pill.
    <header className={cn('sticky top-0 z-30', !isChatHistory && 'md:hidden')}>
      <div className='w-full'>
        <div className='mx-auto flex w-full max-w-2xl justify-center sm:pt-3 md:max-w-none md:pt-0'>
          <div className='glass-element from-background to-background/30 text-foreground border-muted-foreground/20 w-full border-b bg-gradient-to-b sm:rounded-md sm:border md:rounded-none md:border-x-0'>
            {isChatHistory ? <ChatHistoryHeader /> : <ChatHeader />}
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * The desktop nav shell (issue #615): at `md+` the Chat/Recipes/Lists tabs, the
 * settings menu, and the chat-history affordance live in a persistent left
 * sidebar instead of the bottom bar. Hidden below `md` (the bottom bar owns nav
 * there) and, like {@link BottomNav}, absent when signed out or on the
 * chrome-hidden recipe detail screen.
 */
export const AppSidebar = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const slug = useRecipeSlug()
  const t = useTranslations()

  if (!data || pathname === `/recipes/${slug}`) {
    return null
  }

  return (
    <aside className='hidden shrink-0 md:flex'>
      <div className='glass-element border-muted-foreground/20 flex h-full w-60 flex-col gap-4 border-r p-4'>
        <h1 className='px-3 text-lg font-semibold'>{t.nav.appName}</h1>
        <nav className='flex flex-col gap-1'>
          {NAV_ITEMS.map((item) => (
            <NavTab
              key={item.value}
              item={item}
              className='text-card-foreground/75 hover:bg-accent hover:text-accent-foreground/75 flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 transition-colors [&_svg]:size-5'
              activeClassName='bg-card text-card-foreground/75'
            >
              {item.icon}
              <span className='text-sm'>{t.nav[item.label]}</span>
            </NavTab>
          ))}
        </nav>
        <div className='mt-auto flex flex-col gap-1'>
          <ChatHistoryButton />
          <NavDropdownMenu />
        </div>
      </div>
    </aside>
  )
}

export const BottomNav = () => {
  const { data } = useSession()
  const pathname = usePathname()
  const slug = useRecipeSlug()

  if (!data || pathname === `/recipes/${slug}`) {
    return null
  }

  return (
    // At `md+` the sidebar owns the nav, so the bottom bar drops away entirely.
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
 * Opens Chat History for whatever the user is looking at: the current section's
 * chats everywhere, except on `/chat` — the one screen that isn't a section, so
 * it links to the unscoped list of every context's chats.
 */
function ChatHistoryButton() {
  const t = useTranslations()
  const { data: session } = useSession()
  const pathname = usePathname()
  const context = useChatDrawerStore((s) => s.context)

  if (!session) return null

  const params =
    pathname === '/chat'
      ? ''
      : chatScopeToSearchParams(chatContextToScope(context))
  const href = params ? `${CHAT_HISTORY_PATH}?${params}` : CHAT_HISTORY_PATH

  return (
    <NavigationButton
      href={href}
      as={Button}
      variant='ghost'
      size='icon'
      aria-label={t.chat.history.title}
    >
      <HistoryIcon />
    </NavigationButton>
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

function RecipeByIdNavbar() {
  const router = useAppRouter()
  return (
    <nav>
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
    </nav>
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

const NAV_ITEMS = [
  {
    value: '/chat',
    icon: <MessageSquareIcon />,
    label: 'chat'
  },
  {
    value: '/recipes',
    icon: <CookingPotIcon />,
    label: 'recipes'
  },
  {
    value: '/lists',
    icon: <LibraryBigIcon />,
    label: 'lists'
  }
] as const

function BottomNavTabs() {
  const t = useTranslations()
  return (
    <nav className='mx-auto flex w-full justify-between gap-2 overflow-hidden px-3 py-1.5'>
      {NAV_ITEMS.map((item) => (
        <NavTab
          key={item.value}
          item={item}
          className='text-card-foreground/75 active:bg-accent hover:bg-accent hover:text-accent-foreground/75 flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 transition-colors duration-75 active:scale-[99%] [&_svg]:size-5'
          // Active returns to the page's own tone rather than lifting above the
          // bar, so it reads the same way a card does inside a bubble.
          activeClassName='bg-card text-card-foreground/75 rounded-md'
        >
          {item.icon}
          <span className='text-xs'>{t.nav[item.label]}</span>
        </NavTab>
      ))}
    </nav>
  )
}

/**
 * One nav affordance, shared by the bottom bar and the sidebar. Owns the active
 * state (`pathname` match) so both surfaces keep the same active treatment and
 * `aria-current="page"`; the caller supplies the layout via `className` and the
 * per-surface active tone via `activeClassName`.
 */
function NavTab({
  item,
  className,
  activeClassName,
  children
}: {
  item: (typeof NAV_ITEMS)[number]
  className: string
  activeClassName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname.includes(item.value)

  return (
    <NavigationButton
      href={item.value}
      as={Button}
      variant={isActive ? 'default' : 'ghost'}
      aria-current={isActive ? 'page' : undefined}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </NavigationButton>
  )
}
