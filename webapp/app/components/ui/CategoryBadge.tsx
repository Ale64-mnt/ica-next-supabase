import Link from "next/link";

export default function CategoryBadge({ locale, slug, label }:{
  locale: string; slug: string; label: string;
}) {
  return (
    <Link
      href={`/${locale}/blog/category/${slug}`}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
    >
      {label}
    </Link>
  );
}
