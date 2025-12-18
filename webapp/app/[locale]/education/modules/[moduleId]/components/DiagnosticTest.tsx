'use client';

import { useState } from 'react';

interface DiagnosticTestProps {
  moduleId: string;
  locale: string;
}

export default function DiagnosticTest({ moduleId, locale }: DiagnosticTestProps) {
  const [loading, setLoading] = useState(false);

  const startTest = () => {
    setLoading(true);
    console.log('Starting test for module:', moduleId);
    
    // Simula test
    setTimeout(() => {
      setLoading(false);
      alert('Test completato! Dati salvati.');
    }, 2000);
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow">
      <h3 className="text-xl font-bold mb-4">Test Diagnostico</h3>
      <p className="text-gray-600 mb-6">
        20 domande • 25 minuti • Identifica le tue lacune
      </p>
      
      <button
        onClick={startTest}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Test in corso...' : 'Inizia Test'}
      </button>
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        Il test è anonimo e serve per personalizzare il tuo percorso
      </p>
    </div>
  );
}
