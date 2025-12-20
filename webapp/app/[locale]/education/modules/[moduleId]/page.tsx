import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DiagnosticTest from '@/app/components/education/DiagnosticTest/DiagnosticTest';
import AccessibleCard from '@/app/components/accessibility/AccessibleCard';

interface ModulePageProps {
  params: {
    locale: string;
    moduleId: string;
  };
}

interface Competency {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  competencies: Competency[];
  game_scenarios: any[];
  questions: any[];
  badges: any[];
}

// Mock data - sostituire con fetch reale
const mockModuleData: ModuleData = {
  id: 'test-id',
  title: 'Denaro oggi: forme e accesso',
  description: 'Scopri le diverse forme del denaro e come accedervi in sicurezza.',
  difficulty: 'beginner',
  duration: '60 min',
  competencies: [
    { id: '1', code: 'MT-1', title: 'Riconoscere le forme di denaro', description: 'Identificare contanti, carte, monete digitali' },
    { id: '2', code: 'MT-2', title: 'Accesso sicuro', description: 'Utilizzare metodi di pagamento in sicurezza' }
  ],
  game_scenarios: [],
  questions: [],
  badges: []
};

// Mock progress
const mockUserProgress = {
  status: 'not_started' as const,
  score: null
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { locale, moduleId } = params;
  const t = await getTranslations('ModulePage');
  const tCommon = await getTranslations('Common');
  
  // TODO: Sostituire con fetch reale
  const moduleData = mockModuleData;
  const userProgress = mockUserProgress;
  
  if (!moduleData) {
    notFound();
  }

  const currentStep = userProgress.status;

  return (
    <>
      {/* Skip to main content link per screen readers */}
      <a 
        href="#main-content" 
        className="
          sr-only 
          focus:not-sr-only 
          focus:absolute 
          focus:top-4 
          focus:left-4 
          focus:z-50 
          focus:px-4 
          focus:py-2 
          focus:bg-white 
          focus:text-blue-600 
          focus:rounded-lg 
          focus:shadow-lg
        "
      >
        {tCommon('skip_to_content')}
      </a>

      <div className="min-h-screen bg-gray-50">
        {/* HEADER RESPONSIVO E ACCESSIBILE */}
        <header 
          className="
            bg-gradient-to-r 
            from-blue-700 
            to-indigo-800 
            text-white
          "
          role="banner"
          aria-label={t('module_header', { title: moduleData.title })}
        >
          <div className="
            container 
            mx-auto 
            px-4 
            py-6
            md:py-8
            lg:py-12
          ">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb navigation */}
              <nav 
                className="mb-6 md:mb-8" 
                aria-label={t('breadcrumb_navigation')}
              >
                <ol className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                  <li>
                    <Link 
                      href={`/${locale}/education`}
                      className="
                        text-blue-100 
                        hover:text-white 
                        underline 
                        underline-offset-2
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-white 
                        focus:ring-offset-2 
                        focus:ring-offset-blue-700
                        rounded
                      "
                    >
                      {t('education_home')}
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-blue-300">/</li>
                  <li>
                    <Link 
                      href={`/${locale}/education/money_transactions/11-15`}
                      className="
                        text-blue-100 
                        hover:text-white 
                        underline 
                        underline-offset-2
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-white 
                        focus:ring-offset-2 
                        focus:ring-offset-blue-700
                        rounded
                      "
                    >
                      {t('money_transactions')}
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-blue-300">/</li>
                  <li className="font-medium text-white" aria-current="page">
                    {moduleData.title}
                  </li>
                </ol>
              </nav>

              <div className="
                flex 
                flex-col 
                lg:flex-row 
                lg:items-start 
                lg:justify-between 
                gap-6 
                lg:gap-8
              ">
                <div className="lg:flex-1">
                  {/* Badge difficoltà con contrasto garantito */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className="
                        inline-flex 
                        items-center 
                        px-3 
                        py-1 
                        rounded-full 
                        text-sm 
                        font-medium
                        bg-white/20
                        text-white
                        backdrop-blur-sm
                      "
                      aria-label={`Difficoltà: ${moduleData.difficulty}`}
                    >
                      <span 
                        className="
                          w-2 
                          h-2 
                          rounded-full 
                          bg-green-400 
                          mr-2
                        " 
                        aria-hidden="true"
                      />
                      {moduleData.difficulty}
                    </span>
                    <span 
                      className="
                        inline-flex 
                        items-center 
                        px-3 
                        py-1 
                        rounded-full 
                        text-sm 
                        font-medium
                        bg-white/20
                        text-white
                        backdrop-blur-sm
                      "
                    >
                      ⏱️ {moduleData.duration}
                    </span>
                  </div>

                  <h1 
                    className="
                      text-2xl 
                      font-bold 
                      mb-4
                      md:text-3xl
                      lg:text-4xl
                      xl:text-5xl
                    "
                  >
                    {moduleData.title}
                  </h1>
                  
                  <p 
                    className="
                      text-lg 
                      text-blue-100
                      mb-6
                      md:text-xl
                      md:mb-8
                    "
                  >
                    {moduleData.description}
                  </p>
                </div>

                {/* Progress Bar - Sempre visibile ma posizione responsive */}
                <div 
                  className="
                    lg:w-80 
                    xl:w-96
                    bg-white/10 
                    backdrop-blur-sm 
                    rounded-xl 
                    p-4 
                    md:p-6
                    border 
                    border-white/20
                  "
                  role="status"
                  aria-label={t('progress_status')}
                >
                  <h2 className="
                    text-lg 
                    font-semibold 
                    mb-4 
                    text-white
                    md:text-xl
                  ">
                    {t('your_progress')}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-blue-100 mb-1">
                        <span>{t('completion')}</span>
                        <span>0%</span>
                      </div>
                      <div 
                        className="
                          h-2 
                          bg-white/20 
                          rounded-full 
                          overflow-hidden
                        "
                        role="progressbar"
                        aria-valuenow={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div 
                          className="
                            h-full 
                            bg-green-400 
                            rounded-full 
                            w-0
                          " 
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT - Responsive grid */}
        <main 
          id="main-content" 
          className="
            container 
            mx-auto 
            px-4 
            py-8
            md:py-12
          "
          tabIndex={-1}
        >
          <div className="
            max-w-6xl 
            mx-auto
            grid 
            grid-cols-1 
            lg:grid-cols-3 
            gap-8
            xl:gap-12
          ">
            {/* SIDEBAR - Si sposta in alto su mobile */}
            <aside 
              className="
                lg:col-span-1 
                space-y-6 
                md:space-y-8
              "
              aria-label={t('module_information')}
            >
              {/* Competenze Card */}
              <AccessibleCard
                title={t('competencies_covered')}
                description={t('competencies_description')}
              >
                <div className="space-y-4">
                  {moduleData.competencies.map((comp) => (
                    <div 
                      key={comp.id}
                      className="
                        border-l-4 
                        border-blue-500 
                        pl-4 
                        py-2
                      "
                    >
                      <div 
                        className="
                          font-semibold 
                          text-gray-900 
                          text-sm
                          md:text-base
                        "
                      >
                        <span 
                          className="
                            text-blue-600 
                            font-mono 
                            mr-2
                          "
                          aria-label={`Codice competenza: ${comp.code}`}
                        >
                          {comp.code}
                        </span>
                        {comp.title}
                      </div>
                      <p 
                        className="
                          text-gray-600 
                          text-sm 
                          mt-1
                          md:text-base
                        "
                      >
                        {comp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </AccessibleCard>

              {/* Badges Card */}
              <AccessibleCard
                title={t('badges_available')}
                description={t('badges_description')}
              >
                <div className="space-y-4">
                  <div className="
                    flex 
                    items-center 
                    gap-3 
                    p-3 
                    bg-gradient-to-r 
                    from-yellow-50 
                    to-amber-50 
                    rounded-lg
                    border 
                    border-yellow-200
                  ">
                    <div 
                      className="
                        w-12 
                        h-12 
                        bg-gradient-to-br 
                        from-yellow-400 
                        to-amber-500 
                        rounded-lg 
                        flex 
                        items-center 
                        justify-center
                        text-white
                        text-lg
                        md:text-xl
                      "
                      aria-hidden="true"
                    >
                      🏆
                    </div>
                    <div>
                      <div 
                        className="
                          font-semibold 
                          text-gray-900 
                          text-sm
                          md:text-base
                        "
                      >
                        {t('completion_badge')}
                      </div>
                      <div 
                        className="
                          text-gray-600 
                          text-xs 
                          md:text-sm
                        "
                      >
                        {t('complete_module_to_unlock')}
                      </div>
                    </div>
                  </div>
                </div>
              </AccessibleCard>

              {/* Accessibility Controls */}
              <div 
                className="
                  bg-gradient-to-r 
                  from-purple-50 
                  to-violet-50 
                  border 
                  border-purple-200 
                  rounded-xl 
                  p-4 
                  md:p-6
                "
                role="complementary"
                aria-label={t('accessibility_controls')}
              >
                <h3 
                  className="
                    font-semibold 
                    text-gray-900 
                    mb-3 
                    text-sm
                    md:text-base
                  "
                >
                  {t('accessibility_options')}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => document.documentElement.classList.toggle('high-contrast')}
                    className="
                      w-full 
                      text-left 
                      px-3 
                      py-2 
                      bg-white 
                      border 
                      border-gray-300 
                      rounded-lg 
                      hover:bg-gray-50
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-purple-500 
                      focus:border-transparent
                      text-sm
                      md:text-base
                    "
                  >
                    {t('toggle_high_contrast')}
                  </button>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-2">
              {/* Diagnostic Test Section */}
              <section 
                aria-labelledby="diagnostic-test-title"
                className="mb-8 md:mb-12"
              >
                <div className="
                  flex 
                  items-center 
                  justify-between 
                  mb-6
                  flex-col 
                  sm:flex-row 
                  sm:items-center 
                  gap-4 
                  sm:gap-0
                ">
                  <h2 
                    id="diagnostic-test-title"
                    className="
                      text-xl 
                      font-bold 
                      text-gray-900
                      md:text-2xl
                    "
                  >
                    {t('diagnostic_test')}
                  </h2>
                  <div 
                    className="
                      text-sm 
                      text-gray-600
                      md:text-base
                    "
                    aria-live="polite"
                  >
                    {t('test_description')}
                  </div>
                </div>

                <DiagnosticTest
                  questions={moduleData.questions}
                  moduleId={moduleId}
                  locale={locale}
                />
              </section>

              {/* Module Preview - Responsive grid */}
              <section 
                aria-labelledby="module-preview-title"
                className="mt-12"
              >
                <h2 
                  id="module-preview-title"
                  className="
                    text-xl 
                    font-bold 
                    text-gray-900 
                    mb-6
                    md:text-2xl
                  "
                >
                  {t('module_preview')}
                </h2>
                
                <div className="
                  grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  gap-4 
                  md:gap-6
                ">
                  {[1, 2, 3, 4].map((num) => (
                    <div 
                      key={num}
                      className="
                        bg-white 
                        border 
                        border-gray-200 
                        rounded-xl 
                        p-4 
                        md:p-6
                        hover:border-blue-300 
                        hover:shadow-sm
                        transition-all
                        focus-within:ring-2 
                        focus-within:ring-blue-500
                      "
                      tabIndex={0}
                      role="article"
                      aria-label={`Anteprima livello ${num}`}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div 
                          className="
                            w-10 
                            h-10 
                            bg-blue-100 
                            text-blue-600 
                            rounded-lg 
                            flex 
                            items-center 
                            justify-center 
                            font-bold
                            text-sm
                            md:text-base
                            flex-shrink-0
                          "
                          aria-hidden="true"
                        >
                          {num}
                        </div>
                        <div>
                          <h3 
                            className="
                              font-semibold 
                              text-gray-900 
                              mb-2
                              text-sm
                              md:text-base
                            "
                          >
                            {t('level')} {num}
                          </h3>
                          <p 
                            className="
                              text-gray-600 
                              text-xs 
                              md:text-sm
                            "
                          >
                            {t('level_description_prefix')} {num}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* FOOTER ACCESSIBILE */}
        <footer 
          className="
            border-t 
            border-gray-200 
            bg-white 
            mt-12
          "
          role="contentinfo"
          aria-label={t('module_footer')}
        >
          <div className="
            container 
            mx-auto 
            px-4 
            py-6
            md:py-8
          ">
            <div className="
              flex 
              flex-col 
              md:flex-row 
              md:items-center 
              md:justify-between 
              gap-4
            ">
              <div className="text-sm text-gray-600 md:text-base">
                <p>{t('footer_copyright')}</p>
              </div>
              
              <nav aria-label={t('footer_navigation')}>
                <ul className="
                  flex 
                  flex-wrap 
                  gap-4 
                  md:gap-6
                ">
                  <li>
                    <Link
                      href={`/${locale}/accessibility`}
                      className="
                        text-blue-600 
                        hover:text-blue-800 
                        underline 
                        underline-offset-2
                        text-sm
                        md:text-base
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-offset-2
                        rounded
                      "
                    >
                      {t('accessibility_statement')}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="
                        text-blue-600 
                        hover:text-blue-800 
                        underline 
                        underline-offset-2
                        text-sm
                        md:text-base
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-offset-2
                        rounded
                      "
                      aria-label={t('back_to_top')}
                    >
                      {t('back_to_top')}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}