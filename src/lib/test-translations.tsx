import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { TranslationsContext } from '~/hooks/use-translations'
import { FabStack } from '~/components/fab-stack/fab-stack'
import en from '../../public/translations/en.json'

/**
 * Wraps children in a `TranslationsContext` backed by the real English
 * translations, so components under test resolve `useTranslations` exactly as
 * they do in the app. Use this when a test needs to control the rendered tree
 * itself (e.g. injecting a form harness); otherwise reach for
 * {@link renderWithTranslations}.
 */
export function TranslationsTestProvider({
  children
}: {
  children: ReactNode
}) {
  return (
    <TranslationsContext.Provider
      value={{ translations: en as never, locale: 'en' }}
    >
      {children}
      {/* Mounted like the real root layout so FABs registered via
          `useRegisterFab` render (and stay assertable) under test. */}
      <FabStack />
    </TranslationsContext.Provider>
  )
}

/**
 * Renders `ui` inside {@link TranslationsTestProvider}. Drop-in replacement for
 * Testing Library's `render` for any component that calls `useTranslations`.
 */
export function renderWithTranslations(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TranslationsTestProvider, ...options })
}

export { en }
