'use client';

import { useState } from 'react';

interface FinalTestProps {
  moduleId: string;
  locale: string;
  initialScore?: number | null;  // <-- MODIFICA QUI
}

export default function FinalTest({ moduleId, locale, initialScore }: FinalTestProps) {
  const [loading, setLoading] = useState(false);

  const startTest = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Test finale completato! (Simulazione)');
    }, 1500);
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow">
      <h3 className="text-xl font-bold mb-4">Test Finale</h3>
      <p className="text-gray-600 mb-6">
        Verifica le competenze acquisite con questo test finale.
      </p>
      
      {/* Mostra il punteggio iniziale se disponibile */}
      {initialScore !== null && initialScore !== undefined && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            Punteggio test diagnostico: <strong>{initialScore}/100</strong>
          </p>
        </div>
      )}
      
      <button
        onClick={startTest}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Test in corso...' : 'Inizia Test Finale'}
      </button>
    </div>
  );
}