'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

// Questo componente si occupa di cambiare la lingua mantenendo la posizione nella pagina
export default function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('LocaleSwitcher'); // Carica i testi dal dizionario

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Sostituisce la locale corrente nel percorso (pathname) con la nuova
      const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.replace(newPath);
    });
  }

  // WCAG 2.1: Usiamo un'etichetta chiara (aria-label) e un elemento <select>
  return (
    <select
      defaultValue={locale}
      onChange={onSelectChange}
      disabled={isPending}
      aria-label={t('select_language')} // Etichetta accessibile
      style={{
        padding: '5px 10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        fontSize: '1em',
      }}
    >
      <option value="it">{t('it_label')}</option>
      <option value="en">{t('en_label')}</option>
      {/* Aggiungi qui le altre lingue supportate */}
    </select>
  );
}
