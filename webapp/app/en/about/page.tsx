import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About us | ICA – Institute for Conscious Action",
  description:
    "We promote ethically responsible, accessible, and inclusive financial and digital education. Our mission is to provide tools and skills for responsible decisions.",
  alternates: {
    languages: {
      en: "/en/about",
      it: "/it/chi-siamo",
    },
  },
  openGraph: {
    title: "About us | ICA – Institute for Conscious Action",
    description:
      "Ethical, accessible and inclusive financial & digital education. Tools, knowledge and skills for responsible decisions.",
    url: "/en/about",
    siteName: "ICA – Institute for Conscious Action",
    type: "website",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/en",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About us",
        item: "/en/about",
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-3">About us</h1>

      <p>
        We promote ethically responsible, accessible, and inclusive financial
        and digital education. Our mission is to provide tools, knowledge, and
        skills to help individuals, professionals, and organizations make more
        responsible decisions in the use of money and digital technologies,
        while fostering sustainability and social responsibility.
      </p>

      <p>
        We live in a world where finance and technology are increasingly
        connected to everyday choices: from savings management to data
        protection, from conscious consumption to sustainable investments. For
        this reason, we believe it is essential to combine technical expertise,
        ethical awareness, and social inclusion, in line with the European
        Union’s goals of reducing the digital divide and ensuring equal
        opportunities.
      </p>

      <h2>Our main areas of action</h2>
      <ul>
        <li>Training and courses in basic and advanced financial education</li>
        <li>Digital literacy and online safety programs</li>
        <li>
          Awareness-raising on responsible consumption and sustainable finance
        </li>
        <li>Workshops and consulting for businesses, schools, and associations</li>
      </ul>

      <p>
        Thanks to a multidisciplinary team and a network of collaborations at
        the European level, we work to spread a culture that values knowledge as
        a driver of personal and collective growth.
      </p>

      <p>
        <strong>Our goal</strong> is simple yet ambitious: to create a positive
        and measurable impact, fostering a more conscious, sustainable, and
        inclusive future.
      </p>

      <p>
        <strong>Note</strong>: our mission is inspired by and aligned with the{" "}
        <strong>strategic objectives of the European Commission</strong>,
        promoting digital education, financial literacy, sustainability, and
        social inclusion.
      </p>
    </main>
  );
}
