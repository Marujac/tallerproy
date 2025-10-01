// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { BookText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <BookText className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg inline-block">AsistenteDeCrítica</span>
        </Link>
        <div className="flex flex-1 items-center justify-end">
          {!loading && user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
