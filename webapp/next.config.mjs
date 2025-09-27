import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Domini dal tuo file .js
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Domini dal tuo file .mjs
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'twxgfrbcndovazujgcma.supabase.co' }
    ],
  },
};

export default withNextIntl(nextConfig);