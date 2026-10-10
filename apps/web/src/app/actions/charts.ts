'use server';

import { db, markets, results } from '@zenvora/shared/db';
import { desc, eq, and, lte, gte } from 'drizzle-orm';

export async function getChartData(marketSlug: string, type: 'jodi' | 'pana') {
  const [market] = await db.select().from(markets).where(eq(markets.slug, marketSlug)).limit(1);

  if (!market) {
    return [];
  }

  // Fetch results for this market
  const allResults = await db.select()
    .from(results)
    .where(eq(results.marketId, market.id))
    .orderBy(desc(results.resultDate));

  // Group by week
  // We want to generate the last 12 weeks regardless of whether there's data, to keep the grid intact
  const weeks = [];
  const today = new Date();
  
  for (let w = 0; w < 12; w++) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - (w * 7) - today.getDay()); // End on Saturday
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6); // Start on Sunday
    
    const startStr = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}/${weekStart.getFullYear()}`;
    const endStr = `${weekEnd.getDate().toString().padStart(2, '0')}/${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}/${weekEnd.getFullYear()}`;
    
    const days = [];
    for (let d = 0; d < 7; d++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + d);
      const currentDayStr = currentDay.toISOString().split('T')[0];
      
      const dayResult = allResults.find(r => r.resultDate === currentDayStr);
      
      if (!dayResult || dayResult.status !== 'PUBLISHED') {
        days.push(null);
      } else {
        if (type === 'pana') {
          days.push({
            top: dayResult.openPatti || '***',
            mid: dayResult.openAnk && dayResult.closeAnk ? `${dayResult.openAnk}${dayResult.closeAnk}` : '**',
            bot: dayResult.closePatti || '***',
            highlight: false // You could add logic here for special highlights (e.g., doubles)
          });
        } else {
          days.push({
            mid: dayResult.openAnk && dayResult.closeAnk ? `${dayResult.openAnk}${dayResult.closeAnk}` : '**',
            highlight: dayResult.openAnk === dayResult.closeAnk // Highlight doubles
          });
        }
      }
    }
    
    weeks.push({
      dateRange: `${startStr}\nto\n${endStr}`,
      days
    });
  }
  
  return weeks;
}
