import '../styles/globals.css'
import { type AppType } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Layout from 'components/Layout'
import { api } from 'utils/api'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }
}) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </SessionProvider>
  )
}

export default api.withTRPC(App)
