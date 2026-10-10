'use server';

import { db, markets, results, marketSchedules } from '@zenvora/shared/db';
import { desc, eq, and } from 'drizzle-orm';

export async function getLiveHomepageData() {
  const today = new Date().toISOString().split('T')[0];

  const allMarkets = await db.select().from(markets);
  const todayResults = await db.select().from(results).where(eq(results.resultDate, today));

  const formattedMarkets = allMarkets.map(market => {
    const todayResult = todayResults.find(r => r.marketId === market.id);
    let displayResult = '***-**-***';
    
    if (todayResult) {
      if (todayResult.status === 'OPEN_PUBLISHED') {
        displayResult = `${todayResult.openPatti}-${todayResult.openAnk}-***`;
      } else if (todayResult.status === 'PUBLISHED') {
        displayResult = todayResult.resultValue;
      }
    }

    // For fast games (Starline/Jackpot) default format might just be ***-* or ***.
    if (!todayResult) {
      if (market.name.toLowerCase().includes('starline')) displayResult = '***-*';
      if (market.name.toLowerCase().includes('jackpot')) displayResult = '***';
    }

    return {
      id: market.id,
      name: market.name,
      slug: market.slug,
      result: displayResult,
      isSpecial: market.name.toLowerCase().includes('jackpot') || market.name.toLowerCase().includes('starline')
    };
  });

  return {
    mainGames: formattedMarkets.filter(m => !m.name.toLowerCase().includes('starline') && !m.name.toLowerCase().includes('jackpot')),
    starlineGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('starline')),
    jackpotGames: formattedMarkets.filter(m => m.name.toLowerCase().includes('jackpot')),
  };
}
