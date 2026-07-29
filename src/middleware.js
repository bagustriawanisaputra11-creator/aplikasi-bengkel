import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, opts) => res.cookies.set({ name, value, ...opts }),
        remove: (name, opts) => res.cookies.set({ name, value: '', ...opts }),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Halaman publik
  const publicPages = ['/login', '/register']
  if (publicPages.includes(req.nextUrl.pathname)) {
    if (session) return NextResponse.redirect(new URL('/', req.url))
    return res
  }

  // Belum login → redirect ke login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)']
}
