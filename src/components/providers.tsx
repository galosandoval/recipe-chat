'use client'

import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Toast } from './toast'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import {
  TranslationsContext,
  type Translations
} from '~/hooks/use-translations'

export const Providers = ({
  children,
  session,
  translations
}: {
  children: ReactNode
  session: Session | null
  translations: Translations
}) => {
  return (
    <TRPCReactProvider>
      <SessionProvider session={session}>
        <TranslationsContext.Provider value={translations}>
          {children}
          <Toast />
          <Analytics />
        </TranslationsContext.Provider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </SessionProvider>
    </TRPCReactProvider>
  )
}