import '../styles/globals.css'
import {
  Hydrate,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { trpc } from '../utils/trpc'

// let refetchOnWindowFocus = true
// if (process.env.NODE_ENV !== 'production') {
//   refetchOnWindowFocus = false
// }

// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus
//     }
//   }
// })

const App = ({ Component, pageProps }: AppProps) => {
  // const [queryClientState] = useState(() => queryClient)
  // return (
  //   <QueryClientProvider client={queryClientState}>
  //     <Hydrate state={pageProps.dehydratedState}>
  //       <Component {...pageProps} />
  //       <ReactQueryDevtools initialIsOpen={false} />
  //     </Hydrate>
  //   </QueryClientProvider>
  // )
  return <Component {...pageProps} />
}

export default trpc.withTRPC(App)
