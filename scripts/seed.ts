#!/usr/bin/env node
/**
 * Lucky 777 — Seed Script
 *
 * Seeds essential data required for internal testing lifecycle:
 *   1. Welcome bonus campaign (₹100)
 *   2. Market schedules for all 7 days
 *
 * Run with: node --loader ts-node/esm scripts/seed.ts
 * Or via:   npx tsx scripts/seed.ts
 *
 * IMPORTANT: This is a development/staging seed only.
 * Do NOT run against production without explicit confirmation.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  bonusCampaigns,
  markets,
  marketSchedules,
} from '../packages/shared/src/db/schema';
import { eq, sql } from 'drizzle-orm';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:password@127.0.0.1:5454/zenvora?sslmode=disable';

async function seed() {
  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  console.log('🌱 Lucky 777 Seed Script Starting...\n');

  // 1. Welcome Bonus Campaign
  console.log('📦 Seeding bonus_campaigns...');
  const existingCampaigns = await db.select().from(bonusCampaigns).limit(1);
  if (existingCampaigns.length === 0) {
    await db.insert(bonusCampaigns).values({
      name: 'Welcome Bonus — ₹100',
      amountMinor: 100, // ₹100 (stored as rupees, consistent with rest of app)
      currency: 'INR',
      active: true,
      expiresAt: null, // No expiry for now
    });
    console.log('  ✅ Created welcome bonus campaign (₹100)\n');
  } else {
    console.log('  ℹ️  Bonus campaign already exists. Skipping.\n');
  }

  // 2. Market Schedules — all 7 days
  console.log('📅 Seeding market schedules for all 7 days...');
  const allMarkets = await db.select().from(markets);

  if (allMarkets.length === 0) {
    console.log('  ⚠️  No markets found. Run the app first to auto-seed markets, then re-run this script.\n');
  } else {
    const scheduleData: {
      slug: string;
      openTime: string;
      closeTime: string;
    }[] = [
      { slug: 'kalyan-morning', openTime: '09:00:00', closeTime: '12:05:00' },
      { slug: 'milan-day',      openTime: '15:15:00', closeTime: '17:15:00' },
      { slug: 'rajdhani-day',   openTime: '15:00:00', closeTime: '17:00:00' },
      { slug: 'kalyan',         openTime: '16:00:00', closeTime: '18:00:00' },
      { slug: 'milan-night',    openTime: '21:05:00', closeTime: '23:05:00' },
      { slug: 'main-bazar',     openTime: '21:40:00', closeTime: '00:05:00' },
    ];

    for (const market of allMarkets) {
      const sched = scheduleData.find((s) => s.slug === market.slug);
      if (!sched) continue;

      // Delete existing schedules for this market and recreate for all 7 days
      await db.delete(marketSchedules).where(eq(marketSchedules.marketId, market.id));

      const days = [0, 1, 2, 3, 4, 5, 6]; // Sun=0 … Sat=6
      for (const day of days) {
        await db.insert(marketSchedules).values({
          marketId: market.id,
          dayOfWeek: day,
          opensAt: sched.openTime,
          closesAt: sched.closeTime,
          timezone: 'Asia/Kolkata',
          active: true,
        });
      }
      console.log(`  ✅ ${market.name}: schedules created for all 7 days`);
    }
    console.log();
  }

  console.log('✅ Seed complete.\n');
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
