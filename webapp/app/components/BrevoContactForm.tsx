// app/components/BrevoContactForm.tsx
'use client';

import { useParams } from 'next/navigation';

const BREVO_FORM_URLS: Record<string, string> = {
  it: 'https://3cc6c08f.sibforms.com/serve/MUIFADBKXtj6W9rNr_b5yWFp5aw82Yd9Doimp4B0O-JCmneJ9rTBPq-bLczgA7odNvFYZxIxGp9STk6xZ7DWO84lGfouqnNgIuJLG74BdUc87n44AjMNJl3Uv5JTRQJ13qZXQmAfWMSxXZewj83cacnHbhsckaVSrevUuUd44XZOaWOBABVSx15hh60dtb2BDPAXM69b_9CFcknp',
  en: 'https://3cc6c08f.sibforms.com/serve/MUIFAI37xAYLYF3iBLvp9CsmKdfmYhbd-z67Vy30TOZFm7xI0UQTk5R-0c8SYNp_A5t8pey8K2MhMbmdCftCwU1qnhLEqD-CD515NwzQRdbFXsUovgQNOVezvqaktZrbn3dD3PPqwYZ8bjv82fNbHklyKBr66zjNeHCwZByCZRPCKoWW8nHIlGPigWL6ItQiBXfdr92qtET3d43E',
  fr: 'https://3cc6c08f.sibforms.com/serve/MUIFAAa9Ryp5QaoPyGlBhStVzKXeZkW1zE3Wd_GSYJybem6cbELSmsuFtrVlNrextfq6XAcYCbkeZ1IIN-fvAXcHfVwbp6fMNScDP-HDecZkv0QnnG95Q_T-1jX8QljtQDl74GtHaFNV03ExXATIvtVIcoUrdEVe8D10Jm1wabmhHQHfXp5rTTq77QfQQ5iWxabHH_L9LaFe-RdP',
  de: 'https://3cc6c08f.sibforms.com/serve/MUIFAE7MirtQ1CVPXDrcHi7gGDIhtpAGcGR7dvoVc34qVs-CRno6z0uyxoAn1LNVvXMXTLbxtRmujVw6K_WaQmA_rkx22ZFvaeicy7lQdx3P1lzZG98wCRn9o8WmWl8nMlLp1EGdhORe2WHn5UsO_p0o-UavsvElcK19HMRcGuDvLVbM-JaWfhPrcMFqvafIBSFWr2JPsX_LiEWr',
  es: 'https://3cc6c08f.sibforms.com/serve/MUIFAADDQap57zw5AH9NkhCpjk-FWn2fnYpsV9UiZA_4hyuRaNG0Af89_c9Tznrn7hjUwo-742s-cuuor2m8OChRyRDFImqHqawAyC8UYlwwz8fKZ82B2M0fp4RTaEyslsgohKjAvj47QZyW33PcPjzavx6bSIURjqyPeXmEiDGPKZQ1aYmLyVQXg2C4UffB8nOFjnSN4u25p8K6',
};

export default function BrevoContactForm() {
  const params = useParams();
  const locale = (params as { locale?: string } | null)?.locale || 'it';
  const formUrl = BREVO_FORM_URLS[locale] || BREVO_FORM_URLS.it;

  const iframeHeight = 'clamp(720px, calc(100vh - 240px), 980px)' as const;


  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-[560px] bg-white overflow-hidden rounded-lg border border-gray-200">
        <iframe
          src={formUrl}
          title={`Brevo Contact Form - ${locale.toUpperCase()}`}
          loading="lazy"
          className="block w-full border-0 bg-white"
          style={{ height: iframeHeight }}
        />
      </div>
    </div>
  );
}
