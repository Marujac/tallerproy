import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

function useSessionHeader() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch {}
    })();
  }, []);
  return user;
}

export function Header() {
  const user = useSessionHeader();
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
  }
  return (
    <header className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center gap-4 text-center relative">
        <div className="absolute right-0 flex items-center gap-2">
          {user ? (
            <>
              <Link href="/projects" className="text-sm underline">Proyectos (Green)</Link>
              <Link href="/projects-standard" className="text-sm underline">Proyectos estandar</Link>
              <Link href="/horarios" className="text-sm underline">Horarios</Link>
              <Link href="/historial" className="text-sm underline">Historial</Link>
              <Button variant="outline" onClick={handleLogout}>Cerrar sesion</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm underline">Iniciar sesion</Link>
              <Link href="/signup" className="text-sm underline">Registrarse</Link>
            </>
          )}
        </div>
        <BrainCircuit className="h-10 w-10 text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Tutor de Lectura Critica
        </h1>
      </div>
      <p className="mt-4 mx-auto max-w-2xl text-center text-lg text-muted-foreground">
        Pega cualquier texto para descubrir falacias, detectar sesgos y generar un cuestionario de pensamiento critico.
      </p>
    </header>
  );
}
