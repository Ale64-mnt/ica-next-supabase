import BasicPage from "@/components/BasicPage";
import AdminBlogForm from "@/components/AdminBlogForm";
import {getTranslations} from "next-intl/server";

export default async function AdminBlogPage({
  params: {locale}
}: {params:{locale:string}}) {
  const t = await getTranslations({locale, namespace: "admin.blog"});

  return (
    <BasicPage title={t("title")} intro={t("intro")}>
      <AdminBlogForm />
    </BasicPage>
  );
}