#!/usr/bin/env python3
"""
Script per generare automaticamente la struttura delle sezioni del sito
Blog, Supporto e Contatti con file minimi funzionali
"""

import os
import json
from pathlib import Path

def create_directory_structure():
    """Crea la struttura delle directory per le sezioni"""
    
    base_path = Path("webapp/app")
    sections = {
        "blog": [
            "page.tsx",
            "[slug]/page.tsx", 
            "components/BlogList.tsx",
            "components/BlogCard.tsx"
        ],
        "support": [
            "page.tsx",
            "faq/page.tsx",
            "tutorials/page.tsx", 
            "contact-support/page.tsx"
        ],
        "contact": [
            "page.tsx",
            "success/page.tsx",
            "components/ContactForm.tsx",
            "components/ContactInfo.tsx"
        ]
    }
    
    created_files = []
    
    for section, files in sections.items():
        section_path = base_path / section
        section_path.mkdir(parents=True, exist_ok=True)
        
        for file_path in files:
            full_path = section_path / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Crea il file con contenuto minimo
            create_template_file(full_path, section, file_path)
            created_files.append(str(full_path))
    
    return created_files

def create_template_file(file_path, section, template_name):
    """Crea un file template basato sulla sezione e tipo"""
    
    templates = {
        "blog": {
            "page.tsx": blog_list_template(),
            "[slug]/page.tsx": blog_detail_template(),
            "components/BlogList.tsx": blog_list_component(),
            "components/BlogCard.tsx": blog_card_component()
        },
        "support": {
            "page.tsx": support_main_template(),
            "faq/page.tsx": support_faq_template(),
            "tutorials/page.tsx": support_tutorials_template(),
            "contact-support/page.tsx": support_contact_template()
        },
        "contact": {
            "page.tsx": contact_main_template(),
            "success/page.tsx": contact_success_template(),
            "components/ContactForm.tsx": contact_form_component(),
            "components/ContactInfo.tsx": contact_info_component()
        }
    }
    
    content = templates[section].get(template_name, "# Template non trovato\n")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def blog_list_template():
    return '''import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function BlogPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Blog');

  const blogPosts = [
    {
      slug: 'guida-investimenti-base',
      title: t('posts.guida_investimenti_title'),
      excerpt: t('posts.guida_investimenti_excerpt'),
      date: '2024-01-15',
      author: 'Marco Rossi'
    },
    {
      slug: 'finanza-personale-2024', 
      title: t('posts.finanza_personale_title'),
      excerpt: t('posts.finanza_personale_excerpt'),
      date: '2024-01-10',
      author: 'Laura Bianchi'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/${params.locale}/blog/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
'''

def blog_detail_template():
    return '''import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ 
  params 
}: { 
  params: { locale: string; slug: string } 
}) {
  const t = await getTranslations('Blog');
  
  // Simula fetch dati - sostituire con dati reali
  const post = {
    slug: params.slug,
    title: t('posts.guida_investimenti_title'),
    content: t('posts.guida_investimenti_content', { defaultValue: 'Contenuto del post...' }),
    date: '2024-01-15',
    author: 'Marco Rossi'
  };

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex gap-4 text-gray-600 mb-6">
          <span>Di {post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
        <div className="prose max-w-none">
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  );
}
'''

def support_main_template():
    return '''import { getTranslations } from 'next-intl/server';
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
'''

def contact_main_template():
    return '''import { getTranslations } from 'next-intl/server';
import { ContactForm } from './components/ContactForm';
import { ContactInfo } from './components/ContactInfo';

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Contact');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ContactInfo locale={params.locale} />
          <ContactForm locale={params.locale} />
        </div>
      </div>
    </div>
  );
}
'''

# Template per i componenti (versioni semplificate)
def blog_list_component():
    return '''export function BlogList({ posts, locale }: { posts: any[]; locale: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <div key={post.slug} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
'''

def contact_form_component():
    return ''''use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations('Contact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simula invio form
    setTimeout(() => {
      setIsSubmitting(false);
      window.location.href = `/${locale}/contact/success`;
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('form_name')}
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('form_email')}
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          {t('form_message')}
        </label>
        <textarea
          id="message"
          rows={4}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? t('form_sending') : t('form_submit')}
      </button>
    </form>
  );
}
'''

# Template semplificati per gli altri file
def blog_card_component():
    return '''export function BlogCard() {
  return <div>Blog Card Component</div>;
}
'''

def support_faq_template():
    return '''import { getTranslations } from 'next-intl/server';

export default async function FAQPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('faq_title')}</h1>
      <p>Domande frequenti - in sviluppo</p>
    </div>
  );
}
'''

def support_tutorials_template():
    return '''import { getTranslations } from 'next-intl/server';

export default async function TutorialsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('tutorials_title')}</h1>
      <p>Tutorial e guide - in sviluppo</p>
    </div>
  );
}
'''

def support_contact_template():
    return '''import { getTranslations } from 'next-intl/server';

export default async function ContactSupportPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('contact_support_title')}</h1>
      <p>Contatta il supporto - in sviluppo</p>
    </div>
  );
}
'''

def contact_success_template():
    return '''import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ContactSuccessPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Contact');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">{t('success_title')}</h1>
        <p className="text-gray-600 mb-8">{t('success_message')}</p>
        <Link 
          href={`/${params.locale}`}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          {t('success_back_home')}
        </Link>
      </div>
    </div>
  );
}
'''

def contact_info_component():
    return '''import { useTranslations } from 'next-intl';

export function ContactInfo({ locale }: { locale: string }) {
  const t = useTranslations('Contact');
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t('info_title')}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">{t('address_title')}</h3>
          <p className="text-gray-600">{t('address')}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t('email_title')}</h3>
          <p className="text-gray-600">info@icafinanza.it</p>
        </div>
        <div>
          <h3 className="font-semibold">{t('phone_title')}</h3>
          <p className="text-gray-600">+39 02 1234567</p>
        </div>
      </div>
    </div>
  );
}
'''

def generate_translation_keys():
    """Genera le chiavi di traduzione mancanti"""
    
    translation_structure = {
        "Blog": {
            "title": "Blog",
            "posts": {
                "guida_investimenti_title": "Guida agli Investimenti per Principianti",
                "guida_investimenti_excerpt": "Scopri i concetti base per iniziare a investire in modo consapevole...",
                "guida_investimenti_content": "Contenuto completo della guida agli investimenti...",
                "finanza_personale_title": "Finanza Personale 2024", 
                "finanza_personale_excerpt": "Le strategie più efficaci per gestire le tue finanze personali...",
                "finanza_personale_content": "Contenuto completo sulla finanza personale..."
            }
        },
        "Support": {
            "title": "Supporto",
            "faq_title": "Domande Frequenti",
            "tutorials_title": "Tutorial e Guide", 
            "contact_support_title": "Contatta Supporto",
            "categories": {
                "faq_title": "Domande Frequenti",
                "faq_description": "Trova risposte alle domande più comuni",
                "tutorials_title": "Tutorial e Guide",
                "tutorials_description": "Impara con le nostre guide passo-passo", 
                "contact_title": "Contatta Supporto",
                "contact_description": "Assistenza personalizzata per i tuoi problemi"
            }
        },
        "Contact": {
            "title": "Contatti",
            "info_title": "Informazioni di Contatto",
            "address_title": "Indirizzo", 
            "address": "Via Roma 123, 20121 Milano MI",
            "email_title": "Email",
            "phone_title": "Telefono",
            "form_title": "Invia un Messaggio",
            "form_name": "Nome",
            "form_email": "Email",
            "form_message": "Messaggio", 
            "form_submit": "Invia Messaggio",
            "form_sending": "Invio in corso...",
            "success_title": "Messaggio Inviato!",
            "success_message": "Grazie per averci contattato. Ti risponderemo al più presto.",
            "success_back_home": "Torna alla Home"
        }
    }
    
    print("\\n🎯 CHIAVI DI TRADUZIONE DA AGGIUNGERE:")
    print(json.dumps(translation_structure, indent=2, ensure_ascii=False))

def main():
    """Funzione principale"""
    print("🚀 Generazione struttura sezioni...")
    
    try:
        # Crea la struttura dei file
        created_files = create_directory_structure()
        
        print(f"✅ Struttura creata con successo!")
        print(f"📁 File generati: {len(created_files)}")
        
        for file in created_files:
            print(f"   📄 {file}")
            
        # Mostra le chiavi di traduzione necessarie
        generate_translation_keys()
        
        print(f"\\n🎉 Operazione completata!")
        print("📝 Ricorda di aggiungere le chiavi di traduzione nei file messages/")
        
    except Exception as e:
        print(f"❌ Errore durante la generazione: {e}")

if __name__ == "__main__":
    main()