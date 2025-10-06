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
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

export const Providers = ({
  children,
  session,
  translations
}: {
  children: ReactNode
  session: Session | null
  translations: AwaitedTranslations
}) => {
  return (
    <TRPCReactProvider>
      <TranslationsContext.Provider value={translations as Translations}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </SessionProvider>
      </TranslationsContext.Provider>
    </TRPCReactProvider>
  )
}