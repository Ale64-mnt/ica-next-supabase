import React from 'react';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from './components/HeroSection';
import { MissionSection } from './components/MissionSection';
import { TeamSection } from './components/TeamSection';

export default async function AboutPage({ params }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection locale={params.locale} />
      <MissionSection locale={params.locale} />
      <TeamSection locale={params.locale} />
    </div>
  );
}