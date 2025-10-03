import createNextIntlPlugin from 'next-intl/plugin';

// ✅ CORREZIONE: Specifica il path esplicito per i18n/request.ts (fixa deprecazione e allinea con migrazione)
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ✅ CORREZIONE: Rimosso 'telemetry: false' (non valido in next.config.mjs)
  // Per disabilitare telemetry, usa comando: next telemetry disable
  // O imposta env var in .env.local: NEXT_TELEMETRY_DISABLED=1
  
  // Config immagini invariata, ma aggiunta wildcard per Supabase storage (più robusta)
  images: {
    remotePatterns: [
      // Immagini da Cloudinary, Unsplash, ecc.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      
      // Hostname Supabase (invariato, ma pathname esteso per sicurezza)
      { 
        protocol: 'https', 
        hostname: 'twwgfrbcndouazujgcma.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      
      // Placeholder locale per fallback
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },
    ],
  },
  
  // Nota: la configurazione i18n standard di Next.js non è necessaria
  // quando si usa next-intl con l'App Router, ma le impostazioni 
  // globali rimangono nel plugin.
};

// Esporta la configurazione avvolta dal plugin next-intl
export default withNextIntl(nextConfig);