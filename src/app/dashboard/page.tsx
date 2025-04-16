'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('auth') !== 'true') {
      window.location.href = '/login';
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert('Selecione um arquivo OFX');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/converter', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao converter arquivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'versao1.ofx';
      a.click();
      window.URL.revokeObjectURL(url);
    }  catch (err) {
        const error = err as Error;
        alert('❌ Erro ao converter arquivo: ' + error.message);
      }
       finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Conversor de OFX</h2>

      <input
        type="file"
        accept=".ofx"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
      />

      <button
        onClick={handleUpload}
        disabled={isLoading}
        className={`px-6 py-2 rounded-xl text-white transition duration-300 shadow-lg ${
          isLoading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        }`}
      >
        {isLoading ? 'Convertendo...' : 'Enviar e Converter'}
      </button>
    </div>
  );
}
