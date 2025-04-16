// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Conversor OFX',
  description: 'Converta arquivos OFX antigos para versão atual com facilidade.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0a0a0e] text-white min-h-screen`}>
        <div className="w-full max-w-3xl mx-auto px-6 py-10">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Conversor OFX
            </h1>
            <p className="text-sm text-white/70 mt-2">
              Converta arquivos OFX 1.0 (SGML) para formato atualizado com um clique
            </p>
          </header>
          <main className="bg-[#111827] p-8 rounded-2xl shadow-xl border border-white/10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}