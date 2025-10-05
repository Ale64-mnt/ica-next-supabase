import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

export function ArticleHeader({
  title,
  date,
  badge,
  coverUrl,
  coverAlt,
}: {
  title: string;
  date?: string;
  badge?: React.ReactNode;
  coverUrl?: string | null;
  coverAlt?: string;
}) {
  return (
    <header className="space-y-3">
      {badge}
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{title}</h1>
      {date ? <p className="text-sm text-gray-500">{date}</p> : null}
      {coverUrl ? (
        <figure className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={coverUrl}
              alt={coverAlt ?? title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={false}
            />
          </div>
        </figure>
      ) : null}
    </header>
  );
}

export function ArticleBody({ body }: { body: string | null }) {
  if (!body) return null;
  return (
    <article className="content">
      <ReactMarkdown>{body}</ReactMarkdown>
    </article>
  );
}
