import { NextResponse } from 'next/server';
import {
  clearAuthCookie,
  createUser,
  getTokenFromRequest,
  isTokenExpired,
  setAuthCookie,
  signToken,
  validateCredentials,
  verifyToken,
} from '@/backend/controllers/auth';

export async function signupRoute(request) {
  try {
    const body = await request.json();
    let { name, email, password } = body || {};

    email = (email || '').trim();
    password = (password || '').trim();
    name = (name || '').trim();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Datos inválidos. Revisa email y contraseña (mín. 6).' },
        { status: 400 }
      );
    }

    if (!name) {
      name = email.split('@')[0];
    }

    const user = await createUser({ name, email, password });
    if (!user) return NextResponse.json({ error: 'El email ya está registrado.' }, { status: 409 });

    const token = signToken({ sub: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
    setAuthCookie(res, token);
    return res;
  } catch (e) {
    console.error('Signup error', e);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}

export async function loginRoute(request) {
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

export async function meRoute(request) {
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

export async function logoutRoute() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res);
  return res;
}
