'use client'

import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import { Toast } from '~/components/toast'
import { Analytics } from '@vercel/analytics/next'
import type { Session } from 'next-auth'
import { TranslationsContext } from '~/hooks/use-translations'
import type { getTranslations } from '~/utils/get-translations'

export const Providers = ({
	children,
	session,
	translations
}: {
	children: ReactNode
	session: Session | null
	translations: Awaited<ReturnType<typeof getTranslations>>
}) => {
	return (
		<TRPCReactProvider>
			<SessionProvider session={session}>
				<TranslationsContext.Provider value={translations}>
					{children}
					<Toast />
					<Analytics />
				</TranslationsContext.Provider>
			</SessionProvider>
		</TRPCReactProvider>
	)
}
