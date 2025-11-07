import React from 'react';
import { useTranslations } from 'next-intl';

export function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations('About.hero');

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{t('title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}