import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  title: string;
  summary?: string | null;
  slug: string;
  cover_url?: string | null;
};

function localCover(cover: string | null | undefined, slug: string): string {
  if (cover && cover.startsWith("/")) return cover;
  return `/covers/${slug}.jpg`;
}

export default function ArticleCard({ href, title, summary, slug, cover_url }: Props) {
  const src = localCover(cover_url ?? null, slug);

  return (
    <article className="rounded-2xl border p-4 hover:shadow-md transition">
      <div className="relative w-full h-40 mb-3">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover rounded-xl"
        />
      </div>
      <h3 className="text-lg font-semibold mt-1">
        <Link href={href} className="hover:underline">{title}</Link>
      </h3>
      {summary && <p className="text-sm mt-2 line-clamp-3">{summary}</p>}
    </article>
  );
}
