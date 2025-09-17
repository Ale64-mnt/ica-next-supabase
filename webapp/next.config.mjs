import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  localePrefix: "always",
  locales: ["it","en","fr","es","de"],
  defaultLocale: "it"
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "twwgfrbcndouazujgcma.supabase.co", pathname: "/storage/v1/object/public/**" }
    ]
  },reactStrictMode: true
};

export default withNextIntl(nextConfig);