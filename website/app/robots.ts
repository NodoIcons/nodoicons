const trainingBots = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'Bytespider'];

export default function robots() {
  return {
    rules: [
      ...trainingBots.map((userAgent) => ({ userAgent, disallow: ['/sprites/', '/api/pro-preview'] })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://nodoicons.com/sitemap.xml',
  };
}
