import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function SupportPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');

  const supportCategories = [
    {
      title: t('categories.faq_title'),
      description: t('categories.faq_description'),
      href: `/${params.locale}/support/faq`,
      icon: '❓'
    },
    {
      title: t('categories.tutorials_title'), 
      description: t('categories.tutorials_description'),
      href: `/${params.locale}/support/tutorials`,
      icon: '📚'
    },
    {
      title: t('categories.contact_title'),
      description: t('categories.contact_description'),
      href: `/${params.locale}/support/contact-support`, 
      icon: '💬'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supportCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-4">{category.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
            <p className="text-gray-600">{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
