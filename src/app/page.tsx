'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth === 'true') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
      <p>Carregando...</p>
    </main>
  );
}
