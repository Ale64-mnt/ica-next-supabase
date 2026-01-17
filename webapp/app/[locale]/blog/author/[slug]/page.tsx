// app/[locale]/blog/author/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import BioLayout from '@/app/components/bio/BioLayout';

type PageParams = {
  locale: string;
  slug: string;
};

// RIMOSSO: export async function generateStaticParams() { ... }

// Forza render dinamico (database dipendente)
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // ISR opzionale

// Metadata per SEO - MODIFICATO: non chiama createClient()
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  
  // Metadata base senza query al database
  return {
    title: `${slug} - Autore`,
    description: `Pagina autore per ${slug}`,
  };
}

// Funzione per ottenere i dati dell'autore dal database
async function getAuthorData(locale: string, slug: string) {
  try {
    const supabase = createClient();
    
    // Query per ottenere autore con conteggio post
    const { data: author, error } = await supabase
      .from('authors')
      .select(`
        *,
        blog_posts:blog_posts(
          count
        )
      `)
      .eq('slug', slug)
      .eq('locale', locale)
      .single();

    if (error || !author) {
      console.error('Error fetching author:', error);
      return null;
    }

    return {
      // Formato compatibile con BioLayout
      name: author.name,
      title: author.title || '',
      bioContent: author.bio_md || '',
      photoUrl: author.avatar_url || 
        `https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/authors/${slug}.jpg`,
      photoAlt: author.image_alt || `Foto di ${author.name}`,
      isRemotePhoto: true,
      postCount: author.blog_posts?.[0]?.count || 0,
      website: author.website,
      linkedinUrl: author.linkedin_url,
      twitterUrl: author.twitter_url,
      githubUrl: author.github_url,
      email: author.email,
      metaTitle: author.meta_title,
      metaDescription: author.meta_description
    };
  } catch (error) {
    console.error(`Error loading author ${slug}/${locale}:`, error);
    return null;
  }
}

// Pagina principale autore
export default async function AuthorPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const authorData = await getAuthorData(locale, slug);
  
  if (!authorData) {
    notFound();
  }

  return (
    <BioLayout 
      bioData={authorData}
      locale={locale}
      type="author"  // Specifica che è un autore blog
      backLink={`/${locale}/blog`}  // Torna alla lista blog
    />
  );
}