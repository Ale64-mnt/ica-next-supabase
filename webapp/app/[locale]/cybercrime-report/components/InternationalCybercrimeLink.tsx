'use client';

import Link from 'next/link';
import {useTranslations, useLocale} from 'next-intl';
import {Shield, ExternalLink, MapPin} from 'lucide-react';

export function InternationalCybercrimeLink() {
  const t = useTranslations('CybercrimeLink');
  const localeRaw = useLocale();
  const locale = (localeRaw || 'en').replace('_', '-'); // normalizza

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 my-8">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('title')}</h3>
          <p className="text-gray-700 mb-4">{t('description')}</p>

          <Link
            href={`/${locale}/cybercrime-report`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MapPin className="w-4 h-4" />
            {t('button')}
            <ExternalLink className="w-4 h-4" />
          </Link>

          <p className="text-sm text-gray-600 mt-3">{t('subtext')}</p>
        </div>
      </div>
    </div>
  );
}
