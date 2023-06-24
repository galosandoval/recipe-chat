import { Session } from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/chat', '/recipes', '/list']

const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

let redirected = false
export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  const session = (await fetch(`${url.origin}/api/auth/session`, {
    headers: req.headers
  }).then((res) => res.json())) as Session

  if (!session?.user?.id && !redirected && url.pathname === '/') {
    redirected = true
    return NextResponse.redirect(url.href)
  } else if (!session?.user?.id && isProtectedRoute(url.pathname)) {
    return NextResponse.redirect(`${url.origin}/`)
  } else if (session?.expires && session?.user?.id && url.pathname === '/') {
    return NextResponse.redirect(`${url.origin}/chat`)
  }

  return NextResponse.next()
}

export const config = { matcher: ['/', ...protectedRoutes] }
