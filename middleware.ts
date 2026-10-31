import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildSecurityHeaders } from './lib/security.mjs';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = buildSecurityHeaders({
    pathname: request.nextUrl.pathname,
    isProd: process.env.NODE_ENV === 'production',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
