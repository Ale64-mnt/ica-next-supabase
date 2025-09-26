// webapp/app/[locale]/news/page.tsx
import BasicPage from '@/components/BasicPage';
import NewsList from '@/components/NewsList';

type Props = {
  params: { locale: string };
};

export default function Page({ params }: Props) {
  const { locale } = params;

  return (
    <>
      <BasicPage locale={locale} />
      <div style={{ padding: '0 2rem' }}>
        <NewsList />
      </div>
    </>
  );
}
