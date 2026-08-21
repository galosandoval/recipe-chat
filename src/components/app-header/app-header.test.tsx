import { screen } from '@testing-library/react'
import { AppHeader, BottomNav } from './app-header'
import { RouteProvider } from '~/lib/test-route-provider'
import { renderWithTranslations, en } from '~/lib/test-translations'

/**
 * The settings menu pulls in tRPC-backed dialogs; these tests are about which
 * chrome renders at which width, not what the menu holds.
 */
jest.mock('./settings-dropdown-menu', () => ({
  NavDropdownMenu: () => <button aria-label='settings-menu' />
}))

const renderNav = (url: string) =>
  renderWithTranslations(
    <RouteProvider url={url}>
      <BottomNav />
    </RouteProvider>
  )

const currentTab = () => document.querySelector('[aria-current="page"]')

const tabFor = (label: string) => screen.getByText(label).closest('button')!

it('marks the tab matching the current route as the current page', () => {
  renderNav('/recipes')

  expect(currentTab()?.textContent).toBe(en.nav.recipes)
})

it('marks a tab current on nested routes under it', () => {
  renderNav('/chat/history?scope=recipes')

  expect(currentTab()?.textContent).toBe(en.nav.chat)
})

/**
 * The bug was never the `aria-current` logic — it was that the active plate
 * (`bg-card`) sat 0.005 lightness off `--background` and so read as unstyled.
 * Pin the plate itself, or the same invisible highlight can come back green.
 */
it('gives only the current tab a filled plate', () => {
  renderNav('/lists')

  expect(tabFor(en.nav.lists).className).toContain('bg-primary')
  expect(tabFor(en.nav.chat).className).not.toContain('bg-primary')
  expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})

/** At `md+` the sidebar owns navigation, so the two must never both show. */
it('stops rendering at md, where the sidebar takes over', () => {
  const { container } = renderNav('/recipes')

  expect(container.firstElementChild?.className).toContain('md:hidden')
})

/**
 * The header is only allowed to step aside at `md+` when a sidebar is there to
 * replace it — a signed-out visitor has none, so hiding it would strand the
 * settings menu on desktop.
 */
it('keeps the header at md for a signed-out visitor', () => {
  const { container } = renderWithTranslations(
    <RouteProvider url='/' session={null}>
      <AppHeader />
    </RouteProvider>
  )

  expect(container.querySelector('header')?.className).not.toContain(
    'md:hidden'
  )
  expect(screen.queryByRole('button', { name: 'settings-menu' })).toBeTruthy()
})

it('drops the header at md once the sidebar carries the nav', () => {
  const { container } = renderWithTranslations(
    <RouteProvider url='/chat'>
      <AppHeader />
    </RouteProvider>
  )

  expect(container.querySelector('header')?.className).toContain('md:hidden')
})
