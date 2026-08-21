import '~/globals.css'

import { type Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { cookies } from 'next/headers'

import { auth } from '~/server/auth'
import { Providers } from '~/components/providers'
import { getTranslations } from '~/lib/get-translations'
import { ErrorBoundary } from '~/components/error-boundary'
import { RouteTransition } from '~/components/motion/route-transition'
import { AppFooter } from '~/app/app-footer'
import { FabStack } from '~/components/fab-stack/fab-stack'
import { LOCALE_COOKIE_NAME, getLocaleFromCookie } from '~/lib/locale'
import {
  AppHeader,
  AppSidebar,
  BottomNav
} from '~/components/app-header/app-header'

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const { metadata } = await getTranslations(locale)

  return {
    title: metadata.title,
    description: metadata.description,
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      locale,
      type: 'website'
    }
  }
}

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
  const translations = await getTranslations(locale)

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={`${GeistSans.variable}`}
    >
      <body className='h-svh overflow-hidden'>
        <Providers
          session={session}
          translations={translations}
          locale={locale}
        >
          <ErrorBoundary>
            <div className='flex h-full w-full'>
              <AppSidebar />
              {/* Below `md` this stays a centered phone column; at `md+` the
                  sidebar sits beside it and the reading column widens. */}
              <div className='mx-auto flex h-full w-full max-w-2xl flex-col md:max-w-4xl'>
                <AppHeader />
                <RouteTransition>
                  <main className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                    {children}
                  </main>
                </RouteTransition>
                <AppFooter />
                <BottomNav />
                <FabStack />
              </div>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
