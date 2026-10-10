'use server';

import { db, markets, results } from '@zenvora/shared/db';
import { eq } from 'drizzle-orm';

export async function getLiveHomepageData() {
  const today = new Date().toISOString().split('T')[0];

  const allMarkets = await db.select().from(markets);
  const todayResults = await db.select().from(results).where(eq(results.resultDate, today));

  const formattedMarkets = allMarkets.map(market => {
    const todayResult = todayResults.find(r => r.marketId === market.id);
    const isStarline = market.name.toLowerCase().includes('starline');
    const isJackpot = market.name.toLowerCase().includes('jackpot');

    // Default placeholder per market type
    let displayResult = isStarline ? '***-*' : isJackpot ? '***' : '***-**-***';

    if (todayResult) {
      if (todayResult.status === 'PUBLISHED') {
        // For all types, stored resultValue is already in the correct format
        displayResult = todayResult.resultValue;
      } else if (todayResult.status === 'OPEN_PUBLISHED') {
        // Only main games have an open-published intermediate phase
        displayResult = `${todayResult.openPatti}-${todayResult.openAnk}-***`;
      }
    }

    return {
      id: market.id,
      name: market.name,
      slug: market.slug,
      result: displayResult,
      isSpecial: isStarline || isJackpot
    };
  });

  return {
    mainGames: formattedMarkets.filter(m => !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot')),
    starlineGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('starline')),
    jackpotGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('jackpot')),
  };
}
