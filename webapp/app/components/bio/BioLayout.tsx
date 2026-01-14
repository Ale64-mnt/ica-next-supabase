// app/components/bio/BioLayout.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl'; // Import per traduzioni

interface BioLayoutProps {
  bioData: {
    frontmatter: { name: string; role: string; photoAlt: string };
    contentHtml: string;
    photoUrl: string;
    isRemotePhoto?: boolean;
  };
  locale: string;
}

export default function BioLayout({ 
  bioData, 
  locale 
}: BioLayoutProps) {
  const { frontmatter, contentHtml, photoUrl, isRemotePhoto = false } = bioData;
  const t = useTranslations('Bio'); // Usa le traduzioni

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-full">
        {/* COLONNA SINISTRA - "PROFILO" VERTICALE */}
        <div className="lg:w-1/5 xl:w-1/6 bg-gradient-to-b from-blue-900 to-blue-800 p-6 lg:p-8 flex items-center justify-center lg:justify-start">
          <div className="lg:-rotate-90 lg:transform lg:origin-center lg:whitespace-nowrap">
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-wider uppercase">
              {/* 🔥 MODIFICA: "Profilo" invece del nome */}
              {t('profile')}
            </h1>
          </div>
        </div>

        {/* COLONNA DESTRA - CONTENUTO */}
        <div className="lg:w-4/5 xl:w-5/6 bg-white p-6 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Header con nome e ruolo - Mobile/Tablet */}
            <div className="lg:hidden flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {isRemotePhoto ? (
                    <Image
                      src={photoUrl}
                      alt={frontmatter.photoAlt}
                      width={160}
                      height={160}
                      className="object-contain w-full h-full"
                      sizes="(max-width: 768px) 128px, 160px"
                      priority
                    />
                  ) : (
                    <Image
                      src={photoUrl}
                      alt={frontmatter.photoAlt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 128px, 160px"
                      priority
                    />
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {frontmatter.name}
                </h1>
                <h2 className="text-xl md:text-2xl text-blue-700 font-semibold">
                  {frontmatter.role}
                </h2>
              </div>
            </div>

            {/* Header con nome e ruolo - Desktop */}
            <div className="hidden lg:block mb-8">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-6 items-center lg:items-start">
                <div className="w-64 h-64 relative flex items-center justify-center">
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl bg-gray-100">
                    {isRemotePhoto ? (
                      <Image
                        src={photoUrl}
                        alt={frontmatter.photoAlt}
                        width={256}
                        height={256}
                        className="object-contain w-full h-full p-2"
                        sizes="256px"
                        priority
                      />
                    ) : (
                      <Image
                        src={photoUrl}
                        alt={frontmatter.photoAlt}
                        fill
                        className="object-contain p-4"
                        sizes="256px"
                        priority
                      />
                    )}
                  </div>
                </div>
                <div className="lg:mt-4 text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {frontmatter.name}
                  </h1>
                  <h2 className="text-lg lg:text-xl text-blue-700 font-semibold mt-2">
                    {frontmatter.role}
                  </h2>
                </div>
              </div>
            </div>

            {/* Contenuto Bio */}
            <article
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
              aria-label={`Biografia di ${frontmatter.name}`}
            />

            {/* Link per tornare al Team */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                aria-label={`Torna alla pagina del team (${frontmatter.name})`}
              >
                ← {t('backToTeam')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}