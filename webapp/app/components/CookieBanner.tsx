'use client';
'use client';
import { useEffect, useState } from 'react';
const KEY = 'cookie-consent-v1';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ok = typeof window !== 'undefined' && localStorage.getItem(KEY);
    setShow(!ok);
  }, []);
  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 w-full max-w-4xl rounded-2xl bg-gray-900/90 p-4 text-white shadow-lg backdrop-blur">
        <p className="text-sm">
          Usiamo cookie tecnici e, se acconsenti, metriche anonime. Leggi la{' '}
          <a href="/it/privacy" className="underline">Privacy</a>.
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { localStorage.setItem(KEY,'ok'); setShow(false); }}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-white text-gray-900">
            Accetto
          </button>
          <button onClick={() => { localStorage.setItem(KEY,'dismissed'); setShow(false); }}
                  className="rounded-xl px-3 py-2 text-sm bg-gray-700">
            Solo tecnici
          </button>
        </div>
      </div>
    </div>
  );
}
