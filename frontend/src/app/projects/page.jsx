'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { GreenProjectList } from '@/components/projects/GreenProjectList';
import { useSession } from '@/hooks/use-session';

export default function ProjectsPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/projects');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pb-16">
        <GreenProjectList />
      </main>
      <Footer />
    </div>
  );
}
