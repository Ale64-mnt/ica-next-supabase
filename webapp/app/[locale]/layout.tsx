import {NextIntlClientProvider} from 'next-intl';import {ReactNode} from 'react';import Nav from '@/components/Nav';
export const dynamic='force-dynamic';
export default async function LocaleLayout({children,params:{locale}}:{children:ReactNode;params:{locale:string}}){const messages=(await import(`@/messages/${locale}.json`)).default;return(<html lang={locale}><body><Nav/><NextIntlClientProvider messages={messages} locale={locale}>{children}</NextIntlClientProvider></body></html>);}
export async function generateStaticParams(){return[{locale:'it'},{locale:'en'},{locale:'fr'},{locale:'es'},{locale:'de'}];}
