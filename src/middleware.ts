import { type NextRequest } from 'next/server'
import { i18n } from './i18n-config'
import Negotiator from 'negotiator'
import { match as matchLocale } from '@formatjs/intl-localematcher'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const searchParams = req.nextUrl.searchParams

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )
  const hasImages = req.nextUrl.href.includes(`${req.nextUrl.origin}/images/`)
  // Redirect if there is no locale

  if (pathnameIsMissingLocale && !hasImages) {
    const locale = getLocale(req)

    // Build the search params string with all existing parameters
    const searchParamsString = searchParams.toString()
    const queryString = searchParamsString ? `?${searchParamsString}` : ''

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return Response.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${queryString}`,
        req.url
      )
    )
  }
}

function getLocale(request: Request) {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // @ts-expect-error locales are readonly
  const locales: string[] = i18n.locales

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  )

  const locale = matchLocale(languages, locales, i18n.defaultLocale)

  return locale
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
