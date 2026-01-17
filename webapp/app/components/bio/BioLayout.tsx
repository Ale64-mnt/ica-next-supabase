// app/components/bio/BioLayout.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Tipi migliorati per supportare entrambi i tipi
interface BioLayoutProps {
  bioData: {
    // Campi base (comuni a entrambi i tipi)
    name: string;
    title: string;        // Usato come "role" per team, "title" per autori
    bioContent: string;   // Contenuto HTML o Markdown
    photoUrl: string;
    photoAlt: string;
    
    // Campi opzionali
    isRemotePhoto?: boolean;
    
    // Campi specifici per autori
    postCount?: number;
    website?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    
    // Campi specifici per team
    additionalInfo?: string;
    
    // Metadati
    metaTitle?: string;
    metaDescription?: string;
  };
  locale: string;
  type?: 'bio' | 'author';  // Nuovo parametro: distingue il tipo
  backLink?: string;        // Link personalizzato per tornare indietro
}

export default function BioLayout({ 
  bioData, 
  locale,
  type = 'bio',            // Default a 'bio' per retrocompatibilità
  backLink                // Se non fornito, calcolato in base al tipo
}: BioLayoutProps) {
  const { 
    name, 
    title, 
    bioContent, 
    photoUrl, 
    photoAlt, 
    isRemotePhoto = false,
    postCount,
    website,
    linkedinUrl,
    twitterUrl,
    additionalInfo
  } = bioData;
  
  // Usa namespace diverso in base al tipo
  const t = useTranslations(type === 'bio' ? 'Bio' : 'Author');
  
  // Calcola il link di ritorno se non fornito
  const calculatedBackLink = backLink || (
    type === 'bio' ? `/${locale}/about` : `/${locale}/blog`
  );
  
  // Testo per la colonna sinistra
  const leftColumnText = type === 'bio' ? t('profile') : t('author');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-full">
        {/* COLONNA SINISTRA - Testo dinamico in base al tipo */}
        <div className="lg:w-1/5 xl:w-1/6 bg-gradient-to-b from-blue-900 to-blue-800 p-6 lg:p-8 flex items-center justify-center lg:justify-start">
          <div className="lg:-rotate-90 lg:transform lg:origin-center lg:whitespace-nowrap">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-wider uppercase">
              {leftColumnText}
            </h1>
          </div>
        </div>

        {/* COLONNA DESTRA - CONTENUTO */}
        <div className="lg:w-4/5 xl:w-5/6 bg-white p-6 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Header con nome e titolo/ruolo */}
            <div className="lg:hidden flex flex-col md:flex-row md:items-center gap-6 mb-8">
              {/* Immagine - Mobile */}
              <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {renderImage('mobile')}
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {name}
                </h1>
                <h2 className="text-xl md:text-2xl text-blue-700 font-semibold">
                  {title}
                </h2>
                
                {/* Statistiche autore (solo per tipo 'author') */}
                {type === 'author' && postCount !== undefined && (
                  <div className="mt-2 inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded">
                    {t('articlesCount', { count: postCount })}
                  </div>
                )}
              </div>
            </div>

            {/* Header - Desktop */}
            <div className="hidden lg:block mb-8">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-6 items-center lg:items-start">
                {/* Immagine - Desktop */}
                <div className="w-64 h-64 relative flex items-center justify-center">
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl bg-gray-100">
                    {renderImage('desktop')}
                  </div>
                </div>
                <div className="lg:mt-4 text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {name}
                  </h1>
                  <h2 className="text-lg lg:text-xl text-blue-700 font-semibold mt-2">
                    {title}
                  </h2>
                  
                  {/* Statistiche autore (solo per tipo 'author') */}
                  {type === 'author' && postCount !== undefined && (
                    <div className="mt-2 inline-block bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded">
                      {t('articlesCount', { count: postCount })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Link social (solo per autori) */}
            {type === 'author' && (website || linkedinUrl || twitterUrl) && (
              <div className="mb-6 flex flex-wrap gap-4">
                {website && (
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 18h-2v-8h2v8zm-1-9.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm9 9.5h-2v-4.5c0-1.38-1.119-2.5-2.5-2.5S12 12.62 12 14v4.5h-2v-8h2v1.5c.828-1.12 2.172-1.5 3-1.5 2.209 0 4 1.791 4 4v4.5z"/>
                    </svg>
                    Sito web
                  </a>
                )}
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-600 hover:text-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {twitterUrl && (
                  <a 
                    href={twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-600 hover:text-blue-400"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </a>
                )}
              </div>
            )}

            {/* Info aggiuntive (solo per team) */}
            {type === 'bio' && additionalInfo && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Informazioni</h3>
                <p className="text-gray-700">{additionalInfo}</p>
              </div>
            )}

            {/* Contenuto Bio (HTML o Markdown) */}
            <article
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: bioContent }}
              aria-label={`${type === 'bio' ? 'Biografia' : 'Profilo'} di ${name}`}
            />

            {/* Link per tornare indietro (dinamico in base al tipo) */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href={calculatedBackLink}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                aria-label={`Torna a ${type === 'bio' ? 'pagina del team' : 'blog'}`}
              >
                ← {type === 'bio' ? t('backToTeam') : t('backToBlog')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Funzione helper per renderizzare l'immagine
  function renderImage(size: 'mobile' | 'desktop') {
    const dimensions = size === 'mobile' ? { width: 160, height: 160 } : { width: 256, height: 256 };
    
    if (isRemotePhoto) {
      return (
        <Image
          src={photoUrl}
          alt={photoAlt}
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain w-full h-full"
          sizes={size === 'mobile' ? "(max-width: 768px) 128px, 160px" : "256px"}
          priority
        />
      );
    } else {
      return (
        <Image
          src={photoUrl}
          alt={photoAlt}
          fill
          className="object-contain"
          sizes={size === 'mobile' ? "(max-width: 768px) 128px, 160px" : "256px"}
          priority
        />
      );
    }
  }
}