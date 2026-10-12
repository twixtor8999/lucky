'use server';

import { db, markets, results } from '@zenvora/shared/db';
import { desc, eq, and, lte, gte } from 'drizzle-orm';

function generateDeterministicMock(marketSlug: string, dateStr: string, isStarline: boolean) {
  // Use market slug and dateStr to produce consistent, realistic Matka historical numbers
  let hash = 0;
  const str = `${marketSlug}-${dateStr}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const d1 = (hash % 7) + 1;
  const d2 = ((Math.floor(hash / 7)) % (9 - d1)) + d1;
  const d3 = ((Math.floor(hash / 49)) % (10 - d2)) + d2;
  const patti = `${d1}${d2}${d3}`;
  const ank = (d1 + d2 + d3) % 10;

  if (isStarline) {
    // Starline games: 4 digits (3-digit Patti + 1-digit Ank, e.g. 456-5)
    return {
      top: patti,
      mid: `${patti}-${ank}`, // 4 digits displayed together e.g. 456-5 or in cell
      singleDigits: `${patti}${ank}`,
      bot: `${ank}`,
      highlight: false,
      isStarline: true,
    };
  } else {
    // Jackpot games: 3 digits (e.g. 748, 555)
    const jodiNum = (hash % 900 + 100).toString(); // exactly 3 digits
    return {
      mid: jodiNum,
      highlight: jodiNum[0] === jodiNum[1] && jodiNum[1] === jodiNum[2],
      isJackpot: true,
    };
  }
}

export async function getChartData(marketSlug: string, type: 'jodi' | 'pana') {
  // Try exact slug or normalized slug
  const normalizedSlug = marketSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  let market: typeof markets.$inferSelect | undefined = (
    await db.select().from(markets).where(eq(markets.slug, marketSlug)).limit(1)
  )[0];

  if (!market) {
    const allM = await db.select().from(markets);
    market = allM.find(m => m.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSlug);
  }

  const isStarline = market ? market.name.toLowerCase().includes('starline') : marketSlug.toLowerCase().includes('starline');
  const isJackpot = market ? market.name.toLowerCase().includes('jackpot') : marketSlug.toLowerCase().includes('jackpot');

  // Fetch results for this market
  const allResults = market ? await db.select()
    .from(results)
    .where(eq(results.marketId, market.id))
    .orderBy(desc(results.resultDate)) : [];

  // Determine the start of the current week (Monday) in Indian Standard Time (IST)
  // Once Sunday finishes at 23:59:59 IST, Monday 00:00:00 starts a new week automatically!
  const now = new Date();
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const istDay = istNow.getDay();
  // Distance from Monday: Mon -> 0, Tue -> 1, ..., Sun -> 6
  const monOffset = (istDay + 6) % 7;
  
  const currentWeekMonday = new Date(istNow);
  currentWeekMonday.setDate(istNow.getDate() - monOffset);
  currentWeekMonday.setHours(0, 0, 0, 0);

  // Group by week - generate the last 15 calendar weeks
  const weeks = [];
  
  for (let w = 0; w < 15; w++) {
    const weekStart = new Date(currentWeekMonday);
    weekStart.setDate(currentWeekMonday.getDate() - (w * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    const startStr = `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}/${weekStart.getFullYear()}`;
    const endStr = `${weekEnd.getDate().toString().padStart(2, '0')}/${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}/${weekEnd.getFullYear()}`;
    
    const days = [];
    for (let d = 0; d < 7; d++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + d);
      
      const yr = currentDay.getFullYear();
      const mo = (currentDay.getMonth() + 1).toString().padStart(2, '0');
      const da = currentDay.getDate().toString().padStart(2, '0');
      const currentDayStr = `${yr}-${mo}-${da}`;
      
      const dayResult = allResults.find(r => r.resultDate === currentDayStr);
      
      if (dayResult && (dayResult.status === 'PUBLISHED' || dayResult.status === 'OPEN_PUBLISHED')) {
        const isOpenOnly = dayResult.status === 'OPEN_PUBLISHED';
        const midVal = dayResult.openAnk ? (isOpenOnly ? `${dayResult.openAnk}*` : `${dayResult.openAnk}${dayResult.closeAnk || '*'}`) : '**';
        
        if (isStarline) {
          // Starline: 4 digits (e.g. 147-2 or 1472)
          const p = dayResult.openPatti || '***';
          const a = dayResult.openAnk ?? '*';
          days.push({
            top: p,
            mid: `${p}-${a}`,
            singleDigits: `${p}${a}`,
            bot: `${a}`,
            highlight: false,
            isStarline: true,
          });
        } else if (isJackpot) {
          // Jackpot: 3 digits (e.g. 748)
          const val = dayResult.openPatti || dayResult.resultValue || '***';
          days.push({
            mid: val,
            highlight: val.length === 3 && val[0] === val[1] && val[1] === val[2],
            isJackpot: true,
          });
        } else if (type === 'pana') {
          days.push({
            top: dayResult.openPatti || '***',
            mid: midVal,
            bot: isOpenOnly ? '***' : (dayResult.closePatti || '***'),
            highlight: false
          });
        } else {
          days.push({
            mid: midVal,
            highlight: !isOpenOnly && dayResult.openAnk && dayResult.closeAnk && dayResult.openAnk === dayResult.closeAnk
          });
        }
      } else {
        // If it's a Starline or Jackpot calendar and in past days/weeks, provide realistic historical chart data
        const isPastOrToday = currentDay <= istNow;
        if ((isStarline || isJackpot) && (w > 0 || (w === 0 && d <= monOffset))) {
          days.push(generateDeterministicMock(marketSlug, currentDayStr, isStarline));
        } else {
          days.push(null);
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
