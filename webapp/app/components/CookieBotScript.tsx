// app/components/CookieBotScript.tsx
'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    Cookiebot?: {
      consent?: {
        statistics?: boolean;
        marketing?: boolean;
        necessary?: boolean;
        preferences?: boolean;
      };
      debug?: boolean;
      domain?: string;
      consentmode?: boolean;
      runScripts?: () => void;
    };
  }
}

export default function CookieBotScript() {
  useEffect(() => {
    // Funzione per configurare Cookiebot
    const configureCookiebot = () => {
      if (window.Cookiebot) {
        // Configura per sviluppo
        if (process.env.NODE_ENV === 'development') {
          window.Cookiebot.debug = true;
        }
        
        // IMPORANTE: Configura il dominio per evitare l'errore di autorizzazione
        // Usa window.location.hostname per prendere automaticamente localhost o il dominio
        window.Cookiebot.domain = window.location.hostname;
        window.Cookiebot.consentmode = true;
        
        console.log('🛠️ Cookiebot configured for:', window.location.hostname);
      }
    };

    // Configura quando il componente monta
    configureCookiebot();
    
    // Aggiungi un listener per quando Cookiebot si carica
    window.addEventListener('CookiebotOnLoad', configureCookiebot);
    
    // Configura anche con un timeout come fallback
    const timeoutId = setTimeout(configureCookiebot, 2000);
    
    return () => {
      window.removeEventListener('CookiebotOnLoad', configureCookiebot);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Script principale Cookiebot */}
      <Script
        id="cookiebot-script"
        strategy="afterInteractive"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid="a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779"
        data-blockingmode="auto"
        data-culture="auto"
        onLoad={() => {
          console.log('✅ Cookiebot script loaded successfully');
          
          // Configurazione aggiuntiva dopo il load
          if (window.Cookiebot) {
            // Specifica esplicitamente il dominio per localhost
            const hostname = window.location.hostname;
            window.Cookiebot.domain = hostname === 'localhost' ? 'localhost' : hostname;
            window.Cookiebot.consentmode = true;
            
            // Log di debug
            console.log('🌐 Cookiebot domain set to:', window.Cookiebot.domain);
          }
        }}
        onError={(e) => {
          console.error('❌ Cookiebot script failed to load:', e);
          
          // Fallback per sviluppo: crea un banner semplice se Cookiebot fallisce
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Creating development fallback cookie banner');
            
            setTimeout(() => {
              if (!document.getElementById('cookie-fallback')) {
                const fallback = document.createElement('div');
                fallback.id = 'cookie-fallback';
                fallback.innerHTML = `
                  <div style="position:fixed;bottom:0;left:0;right:0;background:#f8f9fa;padding:16px;border-top:1px solid #dee2e6;z-index:9999">
                    <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between">
                      <span>This site uses cookies for analytics. By continuing, you accept our use of cookies.</span>
                      <button onclick="this.parentElement.parentElement.style.display='none'" style="margin-left:16px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer">
                        Accept
                      </button>
                    </div>
                  </div>
                `;
                document.body.appendChild(fallback);
              }
            }, 1000);
          }
        }}
      />
      
      {/* Script di configurazione aggiuntiva per localhost */}
      {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <Script
          id="cookiebot-localhost-fix"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Override per consentire localhost nello sviluppo
              if (window.location.hostname === 'localhost' && window.Cookiebot) {
                console.log('🔧 Applying localhost workaround for Cookiebot');
                window.Cookiebot.domain = 'localhost';
                
                // Monitora errori di autorizzazione
                const originalError = console.error;
                console.error = function(...args) {
                  if (args[0] && args[0].includes('not authorized')) {
                    console.warn('⚠️ Cookiebot authorization warning (expected for localhost)');
                    return;
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
      )}
    </>
  );
}