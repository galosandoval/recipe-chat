'use client'

import { createContext, useContext } from 'react'
import type { getTranslations } from '~/utils/get-translations'

export type Translations = Awaited<ReturnType<typeof getTranslations>>

export const TranslationsContext = createContext<Translations | null>(null)

export const useTranslations = () => {
	const t = useContext(TranslationsContext)

	if (!t) {
		throw new Error(
			'useTranslations must be used within a TranslationsContext'
		)
	}

	return t
}
