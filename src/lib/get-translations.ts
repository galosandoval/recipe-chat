import 'server-only'
import type { Locale } from '~/i18n-config'

/**
 * All translation dictionaries, enumerated explicitly for better linting and
 * TypeScript support. Each grabs the default import for cleaner types.
 */
const dictionaries = {
  en: () =>
    import('public/translations/en.json').then((module) => module.default),
  es: () =>
    import('public/translations/es.json').then((module) => module.default)
}

export const getTranslations = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en()
