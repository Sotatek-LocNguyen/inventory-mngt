import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-me-in-production');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');
  const token = tokenCookie?.value;
  const pathname = req.nextUrl.pathname;

  const authenticated = token ? await isValidToken(token) : false;

  // Redirect authenticated users away from /login
  if (authenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Protect /dashboard/* — unauthenticated users go to /login
  if (!authenticated && pathname.startsWith('/dashboard')) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    // Clear invalid/expired cookie
    if (token) response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = { matcher: ['/login', '/dashboard/:path*'] };
