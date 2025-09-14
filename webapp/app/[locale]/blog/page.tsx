import BasicPage from '@/components/BasicPage';
import {createClient} from '@supabase/supabase-js';

export default async function BlogListPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const {data} = await supabase
    .from('blog')
    .select('id, title, summary, cover_url, published_at')
    .order('published_at', {ascending: false})
    .limit(20);

  return (
    <BasicPage title="Blog" intro="Approfondimenti e guide.">
      <ul style={{listStyle: 'none', padding: 0}}>
        {(data ?? []).map((p) => (
          <li key={p.id} style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>
            <a href={`./blog/${p.id}`} style={{fontWeight: 600}}>{p.title}</a>
            {p.summary ? <> — <i>{p.summary}</i></> : null}
            {p.published_at && (
              <div style={{fontSize: 12, color: '#666'}}>
                {new Date(p.published_at).toLocaleDateString()}
              </div>
            )}
          </li>
        ))}
      </ul>
    </BasicPage>
  );
}
