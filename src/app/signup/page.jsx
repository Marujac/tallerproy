'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SignupInner() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
            toast({ title: 'Bienvenido', description: 'Sesión iniciada.' });
            router.push(nextParam || '/');
            return;
          }
          throw new Error(loginData.error || 'El email ya está registrado. Intenta iniciar sesión.');
        }
        throw new Error(data.error || 'Error al registrarse');
      }
      toast({ title: 'Cuenta creada', description: 'Sesión iniciada correctamente.' });
      router.push(nextParam || '/');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>Regístrate para guardar tu historial.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Correo electrónico</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Contraseña</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creando…' : 'Registrarse'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="underline">Inicia sesión</a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Signup() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-center">Cargando…</div>}>
          <SignupInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

