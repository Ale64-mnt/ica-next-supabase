import React from 'react';
import { useTranslations } from 'next-intl';
import { Target, Heart, Shield } from 'lucide-react';

export function MissionSection({ locale }: { locale: string }) {
  const t = useTranslations('About.mission');

  const values = [
    {
      icon: Target,
      title: t('values.mission_title'),
      description: t('values.mission_description')
    },
    {
      icon: Heart, 
      title: t('values.passion_title'),
      description: t('values.passion_description')
    },
    {
      icon: Shield,
      title: t('values.trust_title'),
      description: t('values.trust_description')
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('title')}</h2>
          <p className="text-lg text-gray-600">{t('description')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-lg p-8 text-center shadow-sm">
              <value.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}