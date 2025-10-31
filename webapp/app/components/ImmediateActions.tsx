// ImmediateActions.tsx aggiornato
export default function ImmediateActions() {
    const t = useTranslations('ImmediateActions');
    
    return (
      <section className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* ICONA */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-blue-200">
              <Image 
                src="/icons/immediate-actions/emergency-warning.svg"
                alt={t('title')}
                width={32}
                height={32}
                unoptimized={true}
              />
            </div>
          </div>
  
          {/* CONTENUTO */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h3>
            
            <ul className="space-y-3 mb-4">
              {/* Punto 1 */}
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span className="text-gray-700">{t('step1')}</span>
              </li>
              
              {/* Punto 2 */}
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span className="text-gray-700">{t('step2')}</span>
              </li>
              
              {/* Punto 3 */}
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span className="text-gray-700">{t('step3')}</span>
              </li>
              
              {/* Punto 4 - CON LINK */}
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span className="text-gray-700">
                  {t.rich('step4', {
                    link: (chunks) => (
                      <Link 
                        href={`/articles/report-cybercrime-eu-official-national-contacts`}
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {chunks}
                      </Link>
                    )
                  })}
                </span>
              </li>
              
              {/* Punto 5 */}
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span className="text-gray-700">{t('step5')}</span>
              </li>
            </ul>
  
            {/* LINK PRINCIPALE IN EVIDENZA */}
            <div className="mt-5 p-4 bg-white rounded-lg border border-blue-200">
              <Link 
                href={`/articles/report-cybercrime-eu-official-national-contacts`}
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('button')}
              </Link>
              <p className="text-sm text-gray-600 mt-2">
                {t('button_description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }