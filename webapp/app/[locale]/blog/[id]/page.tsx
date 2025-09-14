import BasicPage from '@/components/BasicPage';
import {createClient} from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';

export default async function BlogDetailPage({params}: {params: {id: string}}) {
  const {id} = params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const {data} = await supabase
    .from('blog')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) {
    return <BasicPage title="Blog"><p>Post non trovato.</p></BasicPage>;
  }

  const {title, summary, cover_url, body, published_at} = data;

  // Se body è markdown, lo rendiamo con ReactMarkdown.
  // Se incolli HTML e vuoi renderizzarlo come HTML, più avanti possiamo aggiungere un renderer sicuro (sanitize).
  return (
    <BasicPage title={title} intro={summary ?? undefined}>
      {cover_url && (
        <div style={{marginBottom: 16}}>
          <img src={cover_url} alt="" style={{maxWidth: '100%', borderRadius: 8}} />
        </div>
      )}
      <div style={{fontSize: 12, color: '#666', marginBottom: 12}}>
        {published_at && new Date(published_at).toLocaleString()}
      </div>

      <article style={{lineHeight: 1.6}}>
        <ReactMarkdown>{body}</ReactMarkdown>
      </article>
    </BasicPage>
  );
}
