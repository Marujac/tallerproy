import { NextResponse } from 'next/server';
import { setAuthCookie, signToken, validateCredentials } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos.' }, { status: 400 });
    }
    const user = await validateCredentials(email, password);
    if (!user) return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user });
    setAuthCookie(res, token);
    return res;
  } catch (e) {
    console.error('Login error', e);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}

