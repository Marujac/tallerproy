'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function LoginInner() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de inicio de sesión');
      toast({ title: 'Bienvenido', description: 'Inicio de sesión exitoso.' });
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
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Introduce tus credenciales para acceder.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm">Correo electrónico</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Contraseña</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Iniciando…' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta? <a href={`/signup?next=${encodeURIComponent(nextParam)}`} className="underline">Regístrate</a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-center">Cargando…</div>}>
          <LoginInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

