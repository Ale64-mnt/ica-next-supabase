import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  localePrefix: "always",
  locales: ["it","en","fr","es","de"],
  defaultLocale: "it"
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextIntl(nextConfig);