'use server';

import { db, markets, results } from '@zenvora/shared/db';
import { desc } from 'drizzle-orm';

export async function getLiveHomepageData() {
  const allMarkets = await db.select().from(markets);
  const allResults = await db.select().from(results).orderBy(desc(results.resultDate), desc(results.createdAt));

  const formattedMarkets = allMarkets.map(market => {
    const latestResult = allResults.find(r => r.marketId === market.id);
    const isStarline = market.name.toLowerCase().includes('starline');
    const isJackpot = market.name.toLowerCase().includes('jackpot');

    // Default placeholder per market type
    let displayResult = isStarline ? '***-*' : isJackpot ? '***' : '***-**-***';

    if (latestResult) {
      if (latestResult.status === 'PUBLISHED') {
        // For all types, stored resultValue is already in the correct format
        displayResult = latestResult.resultValue;
      } else if (latestResult.status === 'OPEN_PUBLISHED') {
        // Only main games have an open-published intermediate phase
        displayResult = `${latestResult.openPatti}-${latestResult.openAnk}-***`;
      }
    }

    // When admin opens any game, it must automatically be available to play!
    const isOpen = latestResult?.status === 'OPEN_PUBLISHED';

    return {
      id: market.id,
      name: market.name,
      slug: market.slug,
      result: displayResult,
      isSpecial: isStarline || isJackpot,
      isOpen,
    };
  });

  return {
    mainGames: formattedMarkets.filter(m => !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot')),
    starlineGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('starline')),
    jackpotGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('jackpot')),
  };
}
