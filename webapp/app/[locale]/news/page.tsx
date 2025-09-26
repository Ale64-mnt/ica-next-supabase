import BasicPage from "@/components/BasicPage";
import NewsList from "@/components/NewsList";

type Props = { params: { locale: string } };
const supportedLocales = ['it', 'en'] as const;
type SupportedLocale = (typeof supportedLocales)[number];

export default function Page({ params: { locale } }: Props) {
  const isSupported = (supportedLocales as readonly string[]).includes(locale);
  const safeLocale = (isSupported ? locale : 'it') as SupportedLocale;

  return (
    <BasicPage namespace="news">
      <div style={{ padding: "0 2rem" }}>
        <NewsList locale={safeLocale} />
      </div>
    </BasicPage>
  );
}
