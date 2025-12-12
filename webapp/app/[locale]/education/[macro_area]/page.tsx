// app/[locale]/education/[macro_area]/page.tsx - MODIFICATO
import { useTranslations } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserAgeRange } from '@/app/lib/auth/user-context';

interface PageProps {
  params: {
    macro_area: string;
    locale: string;
  };
}

export default async function MacroAreaPage({ params }: PageProps) {
  const { macro_area, locale } = params;
  
  // 1. Verifica macro area valida
  const validMacroAreas = ['money_transactions', 'planning_budgeting', 'managing_risks_insurance', 'financial_landscape'];
  if (!validMacroAreas.includes(macro_area)) {
    notFound();
  }
  
  // 2. Ottieni fascia d'età dell'utente (11-15 per ora hardcoded)
  const userAgeRange = '11-15'; // TODO: da DB o auth context
  
  // 3. REDIRECT automatico alla sua fascia
  redirect(`/${locale}/education/${macro_area}/${userAgeRange}`);
  
  // Il codice sotto non viene mai eseguito a causa del redirect
  return null;
}