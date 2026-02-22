import { i18n, type Locale } from '~/i18n-config'

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

export function getLocaleFromCookie(value: string | undefined): Locale {
  if (value && (i18n.locales as readonly string[]).includes(value)) {
    return value as Locale
  }
  return i18n.defaultLocale
}
