import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import { auth } from '~/server/auth'
import { Toast } from '~/components/toast'
import { Analytics } from '@vercel/analytics/next'

type Props = {
	children: ReactNode
}

export const AppProvider = async ({ children }: Props) => {
	const session = await auth()

	return (
		<TRPCReactProvider>
			<SessionProvider session={session}>
				{children}
				<Toast />
				<Analytics />
			</SessionProvider>
		</TRPCReactProvider>
	)
}
