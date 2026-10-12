import { MetadataRoute } from 'next';
import { db, markets } from '@zenvora/shared/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mantri777.com';

  // Fetch all live markets dynamically
  let allMarkets: { slug: string; updatedAt?: Date }[] = [];
  try {
    allMarkets = await db.select({ slug: markets.slug }).from(markets);
  } catch (err) {
    // fallback static list
    allMarkets = [
      { slug: 'kalyan-morning' },
      { slug: 'milan-day' },
      { slug: 'rajdhani-day' },
      { slug: 'kalyan' },
      { slug: 'milan-night' },
      { slug: 'main-bazar' },
    ];
  }

  const currentDate = new Date().toISOString();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/download`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/welcome`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rates`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic Market Play pages
  const marketPlayRoutes: MetadataRoute.Sitemap = allMarkets.map((m) => ({
    url: `${baseUrl}/markets/${m.slug}/play`,
    lastModified: currentDate,
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  // Dynamic Chart pages (Jodi & Pana)
  const chartRoutes: MetadataRoute.Sitemap = allMarkets.flatMap((m) => [
    {
      url: `${baseUrl}/charts/${m.slug}/jodi`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/charts/${m.slug}/pana`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.75,
    },
  ]);

  return [...staticRoutes, ...marketPlayRoutes, ...chartRoutes];
}
