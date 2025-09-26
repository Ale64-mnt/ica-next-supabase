// webapp/app/[locale]/news/page.tsx
import BasicPage from '@/components/BasicPage';
import NewsList from '@/components/NewsList';

export default function Page() {
  return (
    <>
      <BasicPage namespace="news" />
      <div style={{ padding: '0 2rem' }}>
        <NewsList />
      </div>
    </>
  );
}
