import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Paths that don't need protection
  if (path.startsWith('/login') || path.startsWith('/onboarding') || path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
    return NextResponse.next();
  }

  // Handle Root Path
  if (path === '/') {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // Redirect old dashboard paths to /app
  if (path.startsWith('/dashboard')) {
    const newPath = path.replace('/dashboard', '/app');
    return NextResponse.redirect(new URL(`${newPath}${request.nextUrl.search}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
