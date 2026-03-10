import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Get session from cookies
  const session = req.cookies.get('session')?.value

  // If user is not logged in and trying to access protected pages
  if (!session && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is already logged in and tries to visit /auth
  if (session && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth',
    '/driver',
    '/conductor',
    '/profile'
  ]
}