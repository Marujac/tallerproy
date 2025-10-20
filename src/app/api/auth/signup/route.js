import { NextResponse } from 'next/server';
import { createUser, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
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

