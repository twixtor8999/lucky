'use server';

import { db, markets, marketSchedules, results } from '@zenvora/shared/db';
import { desc } from 'drizzle-orm';
import { parseSlotMinutes, getISTDateAndTime, getDailyTopWinners } from '@/lib/time-utils';

function formatTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let hour = parseInt(hStr, 10);
  const minute = mStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const hourFormatted = String(hour).padStart(2, '0');
  return `${hourFormatted}:${minute} ${ampm}`;
}

export async function getLiveHomepageData() {
  const allMarkets = await db.select().from(markets);
  const schedules = await db.select().from(marketSchedules);
  const allResults = await db.select().from(results).orderBy(desc(results.resultDate), desc(results.createdAt));

  const { dateStr, currentMinutes } = getISTDateAndTime();

  const formattedMarkets = allMarkets.map(market => {
    const latestResult = allResults.find(r => r.marketId === market.id);
    const sched = schedules.find(s => s.marketId === market.id);
    const isStarline = market.name.toLowerCase().includes('starline');
    const isJackpot = market.name.toLowerCase().includes('jackpot');
    const isSpecial = isStarline || isJackpot;

    let displayResult = isStarline ? '***-*' : isJackpot ? '***' : '***-**-***';
    let isOpen = false;

    if (isSpecial) {
      // Check if today's result is published by admin
      const isTodayPublished = latestResult && latestResult.resultDate === dateStr && latestResult.status === 'PUBLISHED';

      if (isTodayPublished) {
        // Numbers published by admin: display result & grey out play button
        displayResult = latestResult.resultValue;
        isOpen = false;
      } else {
        // Not published yet: stays active and playable!
        displayResult = isStarline ? '***-*' : '***';
        isOpen = true;
      }
    } else {
      // Main Market games (two-stage draw)
      if (latestResult) {
        if (latestResult.status === 'PUBLISHED') {
          displayResult = latestResult.resultValue;
        } else if (latestResult.status === 'OPEN_PUBLISHED') {
          displayResult = `${latestResult.openPatti}-${latestResult.openAnk}-***`;
        }
      }
      // When admin opens main game, it becomes available to play
      isOpen = latestResult?.status === 'OPEN_PUBLISHED';
    }

    const openTimeStr = sched ? formatTo12Hour(sched.opensAt) : '09:00 AM';
    const closeTimeStr = sched ? formatTo12Hour(sched.closesAt) : '10:00 AM';

    return {
      id: market.id,
      name: market.name,
      slug: market.slug,
      result: displayResult,
      isSpecial,
      isOpen,
      openTime: openTimeStr,
      closeTime: closeTimeStr,
      rawOpensAt: sched ? sched.opensAt : '99:99:99',
    };
  });

  const topWinners = getDailyTopWinners(dateStr);

  const mainGames = formattedMarkets
    .filter(m => !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot'))
    .sort((a, b) => a.rawOpensAt.localeCompare(b.rawOpensAt));

  return {
    mainGames,
    starlineGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('starline')),
    jackpotGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('jackpot')),
    topWinners,
  };
}
