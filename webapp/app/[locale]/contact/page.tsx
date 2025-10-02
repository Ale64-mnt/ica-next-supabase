// webapp/app/[locale]/contact/page.tsx
'use client'; 
import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';

// Il tuo endpoint API in Next.js che gestirà l'invio a Brevo
const BREVO_API_ENDPOINT = '/api/contact'; 

export default function ContactPage() {
  const t = useTranslations('Contact');
  
  // STATI DEL COMPONENTE
  const [status, setStatus] = useState(''); // 'idle', 'submitting', 'success_message', 'error_message'
  const [formData, setFormData] = useState({
    email: '',
    message: ''
  });

  // GESTORE CAMBIO INPUT
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  }, []);
  
  // GESTORE INVIO FORM
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(t('submitting'));

    try {
      const response = await fetch(BREVO_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Recupera la lingua corrente dal percorso per Brevo/tracciamento
          'Accept-Language': window.location.pathname.split('/')[1] || 'it', 
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus(t('success_message'));
        setFormData({ email: '', message: '' }); // Resetta il form in caso di successo
      } else {
        // Usa il messaggio di errore tradotto
        setStatus(t('error_message'));
      }
    } catch (error) {
      // Errore di rete o API fallita
      setStatus(t('error_message'));
    }
  };

  const isSubmitting = status === t('submitting');
  const isSuccess = status === t('success_message');
  const isError = status === t('error_message');

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">{t('title')}</h1>
      
      <div className="content bg-white p-8 rounded-lg shadow-lg border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{t('form_header')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email_label')}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo Messaggio */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              {t('message_label')}
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          {/* Pulsante di Invio */}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-wait"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
          
          {/* Messaggi di Stato */}
          {isSuccess && (
            <p className="text-green-600 font-medium text-center">{t('success_message')}</p>
          )}
          {isError && (
            <p className="text-red-600 font-medium text-center">{t('error_message')}</p>
          )}
        </form>
      </div>
    </div>
  );
}