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
  type Translations
} from '~/hooks/use-translations'
// import { TranslationsContext } from '~/hooks/use-translationss'
// import type { getTranslations } from '~/lib/get-translations'
// import { Toaster } from '~/components/toast'
// import { ThemeProvider as NextThemesProvider } from 'next-themes'

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
    // <ThemeProvider>
    <TRPCReactProvider>
      <SessionProvider session={session}>
        <TranslationsContext.Provider value={translations}>
          {children}
          {/* <Toaster /> */}
          <Toast />
          <Analytics />
        </TranslationsContext.Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </TRPCReactProvider>
    // </ThemeProvider>
  )
}

// export function ThemeProvider({ children }: { children: ReactNode }) {
//   return (
//     <NextThemesProvider
//       attribute='class'
//       defaultTheme='system'
//       enableSystem
//       disableTransitionOnChange
//     >
//       {children}
//     </NextThemesProvider>
//   )
// }
