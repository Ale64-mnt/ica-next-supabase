// app/components/CookieBotScript.tsx
export default function CookieBotScript() {
  const scriptHtml = `<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779" data-blockingmode="auto" type="text/javascript"></script>`;
  
  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptHtml }}
      // eslint-disable-next-line @next/next/no-sync-scripts
    />
  );
}