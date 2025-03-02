'use client'

import { useTranslations } from '~/hooks/use-translations'
import { ThemeToggle, useTheme } from './theme-toggle'

export function PublicNavbar() {
	const t = useTranslations()
	const { theme, updateTheme } = useTheme()

	return (
		<div className='fixed top-0 z-10 flex w-full justify-center border-b border-b-base-300 bg-gradient-to-b from-base-100 to-base-100/70 text-base-content bg-blend-saturation backdrop-blur transition-all duration-300'>
			<nav className='grid w-full grid-cols-3 place-items-center items-center bg-transparent'>
				<div></div>
				<h1 className='mb-0 text-xl'>{t.nav.appName}</h1>
				<div>
					<ThemeToggle theme={theme} updateTheme={updateTheme} />
				</div>
			</nav>
		</div>
	)
}
