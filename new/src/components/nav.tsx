'use client'

import { useTranslations } from '~/hooks/use-translations'
import { ThemeToggle, useTheme } from './theme-toggle'

export function PublicNavbar() {
	const t = useTranslations()
	const { theme, updateTheme } = useTheme()

	return (
		<>
			<nav className='prose navbar grid w-full grid-cols-3 place-items-center items-center bg-transparent px-4'>
				<div></div>
				<h1 className='mb-0 text-base'>{t.nav['app-name']}</h1>
				<div className='justify-self-end'>
					<ThemeToggle theme={theme} updateTheme={updateTheme} />
				</div>
			</nav>
		</>
	)
}
