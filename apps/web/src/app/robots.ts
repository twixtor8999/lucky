import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mantri777.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/super-secret-admin/',
          '/super-secret-admin/*',
          '/api/',
          '/wallet/',
          '/profile/',
          '/settings/',
          '/setup-mpin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
