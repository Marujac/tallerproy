'use client';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { BiasRepositoryPage } from '@/components/app/bias-repository-page';

export default function RepositorioSesgos() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <BiasRepositoryPage />
      </main>
      <Footer />
    </div>
  );
}
