import BasicPage from '@/components/BasicPage';
import NewsList from '@/components/NewsList';
export const dynamic = 'force-dynamic'; // per vedere aggiornamenti
export default function Page(){
  return <>
    <BasicPage ns="news" />
    <div style={{padding:'0 2rem'}}><NewsList /></div>
  </>;
}
