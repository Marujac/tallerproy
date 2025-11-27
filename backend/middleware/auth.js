import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE = 'AUTH_TOKEN';

async function isValidToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || '');
    if (!secret || secret.length === 0) return false;
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function authMiddleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isApi = pathname.startsWith('/api');

  if (isApi) return NextResponse.next();

  const tokenOk = token ? await isValidToken(token) : false;

  if (!tokenOk && !isAuthPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (tokenOk && isAuthPage) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next internal assets and public files
    '/((?!_next/static|_next/image|favicon.ico|images|assets|public).*)',
  ],
};
