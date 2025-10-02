'use client'; 

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

// Questo componente si occupa di cambiare la lingua mantenendo la posizione nella pagina
export function LocaleSwitcher() { 
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('LocaleSwitcher');

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
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
      aria-label={t('select_language')}
      className="p-1.5 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="it">{t('it_label')}</option>
      <option value="en">{t('en_label')}</option>
    </select>
  );
}
