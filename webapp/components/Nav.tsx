'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';

export default function Nav(){
  const pathname = usePathname() || '/it';
  const locale = (pathname.split('/')[1] || 'it');
  const t = useTranslations('nav');

  const link = (slug:string) => `/${locale}${slug}`;

  return (
    <nav style={{display:'flex',gap:'1rem',padding:'1rem',borderBottom:'1px solid #eee'}}>
      <Link href={link('')}>{t('home')}</Link>
      <Link href={link('/about')}>{t('about')}</Link>
      <Link href={link('/news')}>{t('news')}</Link>
      <Link href={link('/articles')}>{t('articles')}</Link>
      <Link href={link('/faq')}>{t('faq')}</Link>
      <Link href={link('/glossary')}>{t('glossary')}</Link>
      <Link href={link('/contact')}>{t('contact')}</Link>
    </nav>
  );
}
