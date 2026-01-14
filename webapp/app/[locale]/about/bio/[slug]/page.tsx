// app/[locale]/about/bio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import fs from 'fs';
import path from 'path';
import { BioViewer } from '@/app/components/bio/BioViewer';
import BioLayout from '@/app/components/bio/BioLayout';

type PageParams = {
  locale: string;
  slug: string;
};

export async function generateStaticParams() {
  try {
    const biosDir = path.join(process.cwd(), 'content', 'bios');
    
    if (!fs.existsSync(biosDir)) {
      return [];
    }
    
    const slugs = fs.readdirSync(biosDir).filter((item: string) => 
      fs.statSync(path.join(biosDir, item)).isDirectory()
    );
    
    const languages = ['it', 'en', 'fr', 'de', 'es'];
    const params: PageParams[] = [];
    
    slugs.forEach((slug: string) => {
      languages.forEach((locale: string) => {
        params.push({ locale, slug });
      });
    });
    
    return params;
  } catch (error) {
    console.error('Error generating static params for bios:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  
  try {
    const bioData = await BioViewer({ locale, slug });
    return {
      title: `${bioData.frontmatter.name} - ${locale === 'it' ? 'Biografia' : 'Bio'}`,
      description: bioData.frontmatter.role,
    };
  } catch {
    return {
      title: 'Biografia',
      description: 'Pagina biografica',
    };
  }
}

export default async function BioPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  try {
    const bioData = await BioViewer({ locale, slug });
    
    // 🔥 AGGIUNGI locale COME PROP
    return <BioLayout bioData={bioData} locale={locale} />;
    
  } catch (error) {
    console.error(`Errore caricamento bio ${slug} per ${locale}:`, error);
    notFound();
  }
}