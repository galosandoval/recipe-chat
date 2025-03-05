'use client'

import { type ReactNode } from 'react'
import { TRPCReactProvider } from '~/trpc/react'
import { SessionProvider } from 'next-auth/react'
import { Analytics } from '@vercel/analytics/next'
import type { Session } from 'next-auth'
import { TranslationsContext } from '~/hooks/use-translations'
import type { getTranslations } from '~/lib/get-translations'
import { Toaster } from '~/components/toast'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

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
		<ThemeProvider>
			<TRPCReactProvider>
				<SessionProvider session={session}>
					<TranslationsContext.Provider value={translations}>
						<div className='relative max-w-full flex-1'>
							{children}
						</div>
						<Toaster />
						<Analytics />
					</TranslationsContext.Provider>
				</SessionProvider>
			</TRPCReactProvider>
		</ThemeProvider>
	)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute='class'
			defaultTheme='system'
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	)
}

