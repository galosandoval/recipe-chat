import 'server-only'
import type { Locale } from '~/i18n-config'

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
	en: () =>
		import('public/translations/en.json').then((module) => module.default),
	es: () =>
		import('public/translations/es.json').then((module) => module.default)
}

export const getTranslations = async (locale: Locale) =>
	dictionaries[locale]?.() ?? dictionaries.en()
