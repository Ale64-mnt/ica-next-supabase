// webapp/components/ArticleCard.tsx
import Image from "next/image";
import Link from "next/link";

type Props = {
  href: string;
  title: string;
  summary?: string | null;
  category?: string | null;
  coverUrl?: string | null;
};

export default function ArticleCard({ href, title, summary, category, coverUrl }: Props) {
  const src = coverUrl || "https://placehold.co/640x360/png?text=News";
  return (
    <article className="grid grid-cols-1 gap-4 py-6 md:grid-cols-[280px,1fr] md:gap-6 md:py-8 border-b border-neutral-200">
      <Link href={href} className="relative block aspect-[16/9] w-full overflow-hidden rounded md:h-[160px]">
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 280px"
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-col gap-2">
        {category ? (
          <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#0f766e]">
            {category}
          </div>
        ) : null}
        <Link href={href} className="group">
          <h3 className="text-2xl font-extrabold leading-snug group-hover:underline underline-offset-4">
            {title}
          </h3>
        </Link>
        {summary ? (
          <p className="text-[17px] leading-relaxed text-neutral-700">
            {summary}
          </p>
        ) : null}
      </div>
    </article>
  );
}
