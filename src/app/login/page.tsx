'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (password === '123Mudar') {
      localStorage.setItem('auth', 'true');
      router.push('/dashboard');
    } else {
      alert('Senha incorreta');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        type="password"
        placeholder="Digite a senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleLogin}
        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition duration-300 shadow-lg"
      >
        Entrar
      </button>
    </div>
  );
}
