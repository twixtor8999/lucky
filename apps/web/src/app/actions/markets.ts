'use server';

import { db, markets, marketSchedules } from '@zenvora/shared/db';
import { eq, asc } from 'drizzle-orm';
import { MarketStatus, Market } from '@zenvora/shared';
import crypto from 'crypto';

const SEED_MARKETS = [
  { slug: 'kalyan-morning', name: 'Kalyan Morning', status: 'OPEN', openTime: '09:00', closeTime: '12:05' },
  { slug: 'milan-day', name: 'Milan Day', status: 'OPEN', openTime: '15:15', closeTime: '17:15' },
  { slug: 'rajdhani-day', name: 'Rajdhani Day', status: 'OPEN', openTime: '15:00', closeTime: '17:00' },
  { slug: 'kalyan', name: 'Kalyan', status: 'OPEN', openTime: '16:00', closeTime: '18:00' },
  { slug: 'milan-night', name: 'Milan Night', status: 'OPEN', openTime: '21:05', closeTime: '23:05' },
  { slug: 'main-bazar', name: 'Main Bazar', status: 'OPEN', openTime: '21:40', closeTime: '00:05' },
];

export async function seedMarketsAction() {
  const existing = await db.select().from(markets);
  if (existing.length > 0) return { success: true, message: 'Already seeded' };

  for (const m of SEED_MARKETS) {
    const marketId = crypto.randomUUID();
    await db.insert(markets).values({
      id: marketId,
      name: m.name,
      slug: m.slug,
      status: m.status as any,
    });

    await db.insert(marketSchedules).values({
      marketId,
      dayOfWeek: 1, // Let's simplify and assume same schedule everyday
      opensAt: m.openTime + ':00',
      closesAt: m.closeTime + ':00',
    });
  }

  return { success: true, message: 'Seeded' };
}

export async function getMarketsAction() {
  const allMarkets = await db.select().from(markets).orderBy(asc(markets.name));
  const schedules = await db.select().from(marketSchedules);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;

  const result: Market[] = allMarkets.map(m => {
    const sched = schedules.find(s => s.marketId === m.id);
    let isCurrentlyOpen = false;
    
    if (sched) {
      if (sched.opensAt <= sched.closesAt) {
        isCurrentlyOpen = currentTime >= sched.opensAt && currentTime <= sched.closesAt;
      } else { // Crosses midnight
        isCurrentlyOpen = currentTime >= sched.opensAt || currentTime <= sched.closesAt;
      }
    }

    const calculatedStatus = isCurrentlyOpen && m.status === 'OPEN' ? MarketStatus.OPEN : MarketStatus.CLOSED;

    return {
      id: m.id,
      name: m.name,
      slug: m.slug,
      status: calculatedStatus,
      description: m.description || '',
      openTime: sched ? sched.opensAt : '00:00:00',
      closeTime: sched ? sched.closesAt : '00:00:00',
      resultTime: sched ? sched.closesAt : '00:00:00', // Mock
      isOpenToday: true,
      currentOpenTime: sched ? sched.opensAt : '00:00:00',
      currentCloseTime: sched ? sched.closesAt : '00:00:00',
    };
  });

  return { success: true, markets: result };
}

export async function getMarketAction(slug: string) {
  const res = await getMarketsAction();
  if (!res.success || !res.markets) return null;
  return res.markets.find(m => m.slug === slug) || null;
}
