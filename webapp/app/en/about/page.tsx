// webapp/app/en/about/page.tsx
import type { Metadata } from "next";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "About us | ICA – Institute for Conscious Action",
  description:
    "We promote ethically responsible, accessible and inclusive financial and digital education. Our mission is to deliver tools and skills to empower responsible decisions and social impact.",
  alternates: {
    languages: {
      "en-US": `${site}/en/about`,
      "it-IT": `${site}/it/chi-siamo`,
    },
  },
  openGraph: {
    title: "About us | ICA – Institute for Conscious Action",
    description:
      "Financial & digital education with ethics and inclusion at the core. Training, literacy programs, sustainability and social responsibility.",
    url: `${site}/en/about`,
    type: "article",
    locale: "en_US",
  },
};

export default function AboutPage() {
  return (
    <main className="prose mx-auto max-w-3xl px-6 py-10">
      <h1>About us</h1>

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
        ethical awareness, and social inclusion—aligned with the European
        Union’s goals of reducing the digital divide and ensuring equal
        opportunities.
      </p>

      <h2>Our main areas of action</h2>
      <ul className="list-disc pl-6">
        <li>Training and courses in basic and advanced financial education</li>
        <li>Digital literacy and online safety programs</li>
        <li>Awareness-raising on responsible consumption and sustainable finance</li>
        <li>Workshops and consultancy for businesses, schools, and associations</li>
      </ul>

      <p>
        Thanks to a multidisciplinary team and a network of collaborations at
        the European level, we work to spread a culture that values knowledge as
        a driver of personal and collective growth.
      </p>

      <h2>Our goal</h2>
      <p>
        Simple yet ambitious: creating a positive and measurable impact,
        fostering a more conscious, sustainable, and inclusive future.
      </p>

      <p className="text-sm opacity-80">
        <strong>Note</strong>: our mission is inspired by and aligned with the{" "}
        <a
          href="https://digital-strategy.ec.europa.eu/en/policies/digital-education-action-plan"
          target="_blank"
          rel="noopener noreferrer"
        >
          EU Digital Education Action Plan 2021–2027
        </a>{" "}
        and the{" "}
        <a
          href="https://commission.europa.eu/strategy-and-policy/eu-budget/long-term-eu-budget/2021-2027/programmes/erdf_en"
          target="_blank"
          rel="noopener noreferrer"
        >
          European funding programmes
        </a>
        , which promote digital education, financial literacy, sustainability,
        and social inclusion.
      </p>
    </main>
  );
}
