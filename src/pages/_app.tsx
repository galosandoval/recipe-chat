import '../globals.css'
import { type AppType } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Layout from '~/components/layout'
import { api } from '~/utils/api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toast } from '~/components/toast'
import { Roboto } from 'next/font/google'
import { appWithTranslation } from 'next-i18next'
import { Analytics } from '@vercel/analytics/react'

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto'
})

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }
}) => {
  const font = `${roboto.variable}`

  return (
    <SessionProvider session={session}>
      <Layout font={font}>
        <Component {...pageProps} />
      </Layout>
      <Toast />
      <Analytics />
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  )
}

export default api.withTRPC(appWithTranslation(App))
