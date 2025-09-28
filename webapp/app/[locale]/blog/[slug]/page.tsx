import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Definiamo i tipi di dati che ci aspettiamo
type Props = {
  params: {
    slug: string;
    locale: string;
  };
};

// Funzione per caricare i dati del post dal database
async function getBlogPost(slug: string, locale: string) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('articles') // o 'blog_posts' se stai usando quella tabella
    .select('title, body_md, lang, articles(title, slug, lang)') 
    .eq('slug', slug)
    .eq('lang', locale)
    .single();

  if (!post) {
    notFound();
  }
  return post;
}

// Questo è il componente React che viene esportato
export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug, params.locale);
  const relatedArticle = post.articles;

  return (
    <article className="prose lg:prose-xl mx-auto my-12 px-4">
      <h1>{post.title}</h1>
      <ReactMarkdown>{post.body_md}</ReactMarkdown>

      {relatedArticle && (
        <div className="mt-12 p-6 border-t bg-gray-50 rounded-lg">
          <h4 className="font-bold text-lg">Per approfondire:</h4>
          <Link href={`/${relatedArticle.lang}/articles/${relatedArticle.slug}`} className="text-blue-600 hover:underline">
            {relatedArticle.title}
          </Link>
        </div>
      )}
    </article>
  );
}