import { screen } from '@testing-library/react'
import { SidebarNav } from './sidebar-nav'
import { RouteProvider } from '~/lib/test-route-provider'
import { renderWithTranslations, en } from '~/lib/test-translations'

/**
 * The settings menu pulls in tRPC-backed dialogs; the sidebar's contract is
 * that it mounts the menu, not what the menu renders.
 */
jest.mock('./settings-dropdown-menu', () => ({
  NavDropdownMenu: () => <button aria-label='settings-menu' />
}))

const renderSidebar = (
  url: string,
  options?: { session?: null; params?: Record<string, string> }
) =>
  renderWithTranslations(
    <RouteProvider
      url={url}
      session={options?.session}
      params={options?.params}
    >
      <SidebarNav />
    </RouteProvider>
  )

const currentItem = () => document.querySelector('[aria-current="page"]')

const itemFor = (label: string) => screen.getByText(label).closest('button')!

it('marks the item matching the current route as the current page', () => {
  renderSidebar('/recipes')

  expect(currentItem()?.textContent).toBe(en.nav.recipes)
})

it('marks an item current on nested routes under it', () => {
  renderSidebar('/chat/history?scope=recipes')

  expect(currentItem()?.textContent).toBe(en.nav.chat)
})

it('gives only the current item a filled plate', () => {
  renderSidebar('/lists')

  expect(itemFor(en.nav.lists).className).toContain('bg-primary')
  expect(itemFor(en.nav.chat).className).not.toContain('bg-primary')
  expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})

it('reaches the settings menu and chat history from the sidebar', () => {
  renderSidebar('/recipes')

  expect(screen.queryByRole('button', { name: 'settings-menu' })).toBeTruthy()
  expect(
    screen.queryByRole('button', { name: en.chat.history.title })
  ).toBeTruthy()
})

it('stays hidden below md, matching the bottom bar it replaces', () => {
  const { container } = renderSidebar('/recipes')

  expect(container.querySelector('aside')?.className).toContain('hidden')
  expect(container.querySelector('aside')?.className).toContain('md:flex')
})

it('does not render on the recipe detail screen, which hides chrome', () => {
  const { container } = renderSidebar('/recipes/pesto', {
    params: { slug: 'pesto' }
  })

  expect(container.querySelector('aside')).toBeNull()
})

it('does not render for a signed-out visitor', () => {
  const { container } = renderSidebar('/recipes', { session: null })

  expect(container.querySelector('aside')).toBeNull()
})
