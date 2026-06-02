import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deixa passar: assets estáticos, API routes e server actions (POST)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    request.method === 'POST'
  ) {
    return NextResponse.next()
  }

  const isAuthRoute = pathname.startsWith('/login')

  // Detecta sessão pelo cookie do Supabase (sem chamada de rede)
  const hasSession = request.cookies.getAll().some(
    c => c.name.includes('auth-token') && c.value.length > 10
  )

  if (!hasSession && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
