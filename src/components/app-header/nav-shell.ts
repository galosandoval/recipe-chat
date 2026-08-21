'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import {
  CookingPotIcon,
  LibraryBigIcon,
  MessageSquareIcon,
  type LucideIcon
} from 'lucide-react'

/** The Chat History route, which swaps the app header for a back header. */
export const CHAT_HISTORY_PATH = '/chat/history'

/**
 * The three top-level sections, shared by the mobile bottom tab bar and the
 * `md+` sidebar so both render the same routes, icons, and accessible names.
 */
export const NAV_ITEMS = [
  { value: '/chat', Icon: MessageSquareIcon, label: 'chat' },
  { value: '/recipes', Icon: CookingPotIcon, label: 'recipes' },
  { value: '/lists', Icon: LibraryBigIcon, label: 'lists' }
] as const satisfies ReadonlyArray<{
  value: string
  Icon: LucideIcon
  label: 'chat' | 'recipes' | 'lists'
}>

/**
 * The current-section plate, shared by the bottom bar and the sidebar.
 *
 * A solid primary plate, not a tint: `bg-card` differs from `--background` by
 * 0.005 lightness, and even `bg-accent` lands within a hair of the bar it sits
 * on — and matches the hover state, so a hovered tab read as the current one.
 * Primary clears the background by 5:1 in light and 9:1 in dark, and hover
 * keeps the plate instead of washing it back to accent.
 */
export const ACTIVE_NAV_ITEM_CLASSES =
  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-semibold'

/** Whether `pathname` is inside the section a nav item points at. */
export function isNavItemCurrent(pathname: string, value: string) {
  return pathname.includes(value)
}

/**
 * Whether the app's nav chrome belongs on screen: signed in, and not on a
 * screen that deliberately hides chrome (the Recipe detail, which brings its
 * own back/edit bar). The bottom tab bar and the `md+` sidebar are the same
 * chrome at two widths, so both read this — and the header uses it to know
 * whether a sidebar is there to replace it at `md+`.
 */
export function useNavChromeVisible() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const slug = useRecipeSlug()

  return !!session && pathname !== `/recipes/${slug}`
}
