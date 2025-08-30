'use client'

import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Toast } from './toast'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import {
  TranslationsContext,
  type AwaitedTranslations,
  type Translations
} from '~/hooks/use-translations'

import { AuthModalProvider } from './auth/auth-modals'
import { ChatsDrawerProvider } from './chats-drawer'

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
          <ChatsDrawerProvider>
            <AuthModalProvider>
              {children}
              <Toast />
              <Analytics />
            </AuthModalProvider>
          </ChatsDrawerProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </SessionProvider>
      </TranslationsContext.Provider>
    </TRPCReactProvider>
  )
}