/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://eduethica.eu',
  generateRobotsTxt: true,
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin', '/preview'],
  transform: async (config, path) => ({
    loc: path,
    changefreq: 'weekly',
    priority: path.includes('/blog') ? 0.9 : 0.7,
    lastmod: new Date().toISOString(),
  }),
};
