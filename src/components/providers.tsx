'use client'

import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Analytics } from '@vercel/analytics/react'
import {
  TranslationsContext,
  type AwaitedTranslations,
  type Translations
} from '~/hooks/use-translations'
import type { Locale } from '~/i18n-config'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'
import { NavigationHandler } from './navigation-handler'

export const Providers = ({
  children,
  session,
  translations,
  locale
}: {
  children: ReactNode
  session: Session | null
  translations: AwaitedTranslations
  locale: Locale
}) => {
  return (
    <TRPCReactProvider>
      <TranslationsContext.Provider
        value={{ translations: translations as Translations, locale }}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <NavigationHandler />
            {children}
            <Toaster position='top-right' />
            <Analytics />
          </ThemeProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </SessionProvider>
      </TranslationsContext.Provider>
    </TRPCReactProvider>
  )
}