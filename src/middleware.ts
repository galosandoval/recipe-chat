import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import Negotiator from 'negotiator'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import { LOCALE_COOKIE_NAME } from '~/lib/locale'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Backward compat: redirect /en/... or /es/... to clean path
  for (const locale of i18n.locales) {
    if (pathname === `/${locale}`) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url, 301)
    }
    if (pathname.startsWith(`/${locale}/`)) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.slice(`/${locale}`.length) || '/'
      return NextResponse.redirect(url, 301)
    }
  }

  // If cookie already set and valid, pass through
  const existingCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value
  if (existingCookie && (i18n.locales as readonly string[]).includes(existingCookie)) {
    return NextResponse.next()
  }

  // Detect locale from Accept-Language and set cookie
  const detectedLocale = getLocaleFromRequest(req)
  const response = NextResponse.next()
  response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  })
  return response
}

function getLocaleFromRequest(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  return matchLocale(languages, locales, i18n.defaultLocale)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
