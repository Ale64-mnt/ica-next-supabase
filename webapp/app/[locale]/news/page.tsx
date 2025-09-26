// webapp/app/[locale]/news/page.tsx
import NewsList from '@/components/NewsList';
import BasicPage from '@/components/BasicPage';

export default function Page() {
  return (
    <>
      <BasicPage />
      <div style={{ padding: '0 2rem' }}>
        <NewsList />
      </div>
    </>
  );
}
