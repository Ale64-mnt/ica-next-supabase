// app/[locale]/education/components/BrevoFormEnhanced.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

const BREVO_FORM_URLS: Record<string, string> = {
  it: "https://3cc6c08f.sibforms.com/serve/MUIFADK4jPsDD3MnHZmk4bVY8NT4dLkPdEYJU3OwxHtaACpRggPw9cuPrDX82ayyb28gvF1ZyORfnue0EvHDtVrs3JF-79GiAOlo6n-dCi1S1FbT5Wi_ATlDN0WnkCq8uX489J60Z8aC_xH2wf-LGodGDJzCUtnMJlpFvOuaXTMy_1V6nGD4j3PZkSRPkaVTek8iYEYCmoZ4dUXr",
  en: "https://3cc6c08f.sibforms.com/serve/MUIFAEkWz9vGFG51_nM3iOBvU5Hn3scmZtkgQwE-hnB1gKPcke697SRiYxm_qQUYmAlMTu_8i0EhooMs6X4pI5RhGAUfNgi2BqZCpZ5x3XyIhg6LJFXyJ8o52jaH8d0LSaz906JUvBVJ5ZpvMJD9-dIOVWOG4v-lU60tFEli66aCQgdfTzqQ_9bpevXdHKp-IJTg3sthvdkEzPcd",
  fr: "https://3cc6c08f.sibforms.com/serve/MUIFAEkWz9vGFG51_nM3iOBvU5Hn3scmZtkgQwE-hnB1gKPcke697SRiYxm_qQUYmAlMTu_8i0EhooMs6X4pI5RhGAUfNgi2BqZCpZ5x3XyIhg6LJFXyJ8o52jaH8d0LSaz906JUvBVJ5ZpvMJD9-dIOVWOG4v-lU60tFEli66aCQgdfTzqQ_9bpevXdHKp-IJTg3sthvdkEzPcd",
  de: "https://3cc6c08f.sibforms.com/serve/MUIFAEkWz9vGFG51_nM3iOBvU5Hn3scmZtkgQwE-hnB1gKPcke697SRiYxm_qQUYmAlMTu_8i0EhooMs6X4pI5RhGAUfNgi2BqZCpZ5x3XyIhg6LJFXyJ8o52jaH8d0LSaz906JUvBVJ5ZpvMJD9-dIOVWOG4v-lU60tFEli66aCQgdfTzqQ_9bpevXdHKp-IJTg3sthvdkEzPcd",
  es: "https://3cc6c08f.sibforms.com/serve/MUIFAEkWz9vGFG51_nM3iOBvU5Hn3scmZtkgQwE-hnB1gKPcke697SRiYxm_qQUYmAlMTu_8i0EhooMs6X4pI5RhGAUfNgi2BqZCpZ5x3XyIhg6LJFXyJ8o52jaH8d0LSaz906JUvBVJ5ZpvMJD9-dIOVWOG4v-lU60tFEli66aCQgdfTzqQ_9bpevXdHKp-IJTg3sthvdkEzPcd",
};

const DEFAULT_LOCALE = "it";

export default function BrevoFormEnhanced() {
  const params = useParams();
  const currentLocale = (params?.locale as string | undefined) ?? DEFAULT_LOCALE;

  const formUrl = useMemo(() => {
    return BREVO_FORM_URLS[currentLocale] ?? BREVO_FORM_URLS[DEFAULT_LOCALE];
  }, [currentLocale]);

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full max-w-[560px] mx-auto bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600">Caricamento modulo...</p>
          </div>
        </div>
      )}

      <iframe
        src={formUrl}
        title={`Iscrizione newsletter EduEthica - ${currentLocale.toUpperCase()}`}
        className="w-full border-0 block"
        style={{
          height: "clamp(520px, 70vh, 640px)", // ✅ centrato su ~600px
        }}
        scrolling="auto"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}
