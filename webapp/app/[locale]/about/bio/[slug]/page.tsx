// app/[locale]/about/bio/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getBioViewerData } from '@/app/components/bio/BioViewer';
import BioLayout from '@/app/components/bio/BioLayout';

type PageParams = {
  locale: string;
  slug: string;
};

export async function generateStaticParams() {
  try {
    // Usa la stessa logica per generare i percorsi statici
    const fs = await import('fs');
    const path = await import('path');
    
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
    const bioData = await getBioViewerData({ 
      locale, 
      slug, 
      type: 'bio' 
    });
    
    if (!bioData) {
      return {
        title: 'Biografia',
        description: 'Pagina biografica',
      };
    }
    
    return {
      title: bioData.metaTitle || `${bioData.name} - Biografia`,
      description: bioData.metaDescription || bioData.title,
      openGraph: {
        title: bioData.metaTitle || `${bioData.name} - Biografia`,
        description: bioData.metaDescription || bioData.title,
        images: bioData.photoUrl ? [{ url: bioData.photoUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: bioData.metaTitle || `${bioData.name} - Biografia`,
        description: bioData.metaDescription || bioData.title,
        images: bioData.photoUrl ? [bioData.photoUrl] : [],
      },
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

  const bioData = await getBioViewerData({ 
    locale, 
    slug, 
    type: 'bio'  // Specifica che è una biografia team
  });
  
  if (!bioData) {
    notFound();
  }

  return (
    <BioLayout 
      bioData={bioData}
      locale={locale}
      type="bio"  // Specifica che è una biografia team
      // backLink è opzionale, di default sarà /{locale}/about
    />
  );
}