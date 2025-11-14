import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, isTokenExpired } from '@/lib/auth';

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ user: null });
  if (isTokenExpired(token)) {
    return NextResponse.json({ user: null, error: 'Token expirado' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });
  const user = { id: payload.sub, name: payload.name, email: payload.email };
  return NextResponse.json({ user });
}
