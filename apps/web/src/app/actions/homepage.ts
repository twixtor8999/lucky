'use server';

import { db, markets, results } from '@zenvora/shared/db';
import { desc } from 'drizzle-orm';
import { parseSlotMinutes, getISTDateAndTime, getDailyTopWinners } from '@/lib/time-utils';

export async function getLiveHomepageData() {
  const allMarkets = await db.select().from(markets);
  const allResults = await db.select().from(results).orderBy(desc(results.resultDate), desc(results.createdAt));

  const { dateStr, currentMinutes } = getISTDateAndTime();

  const formattedMarkets = allMarkets.map(market => {
    const latestResult = allResults.find(r => r.marketId === market.id);
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

    return {
      id: market.id,
      name: market.name,
      slug: market.slug,
      result: displayResult,
      isSpecial,
      isOpen,
    };
  });

  const topWinners = getDailyTopWinners(dateStr);

  return {
    mainGames: formattedMarkets.filter(m => !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot')),
    starlineGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('starline')),
    jackpotGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('jackpot')),
    topWinners,
  };
}
