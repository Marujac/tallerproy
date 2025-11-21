'use client';
import { Header } from '@/components/app/header';
import { CritiqueAssistPage } from '@/components/app/critique-assist-page';
import { Footer } from '@/components/app/footer';
import { useSession } from '@/hooks/use-session';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <CritiqueAssistPage />
      </main>
      <Footer />
    </div>
  );
}
