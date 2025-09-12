import BasicPage from '@/components/BasicPage';
import ArticlesList from '@/components/ArticlesList';
export const dynamic = 'force-dynamic';
export default function Page(){
  return <>
    <BasicPage ns="articles" />
    <div style={{padding:'0 2rem'}}><ArticlesList /></div>
  </>;
}
