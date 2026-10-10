import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../packages/shared/src/db/schema';
import * as fs from 'fs';
import * as path from 'path';

// Manual simple dotenv parser
const envPath = path.resolve(__dirname, '../apps/web/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].replace(/"/g, '').trim();
  }
});

const client = postgres(dbUrl);
const db = drizzle(client, { schema });

const GAMES = [
  { name: 'SHREE GANESH', openTime: '10:00 AM', closeTime: '11:00 AM', type: 'MAIN' },
  { name: 'OMKAR MORNING', openTime: '10:30 AM', closeTime: '11:30 AM', type: 'MAIN' },
  { name: 'GOA MORNING', openTime: '11:00 AM', closeTime: '12:00 PM', type: 'MAIN' },
  { name: 'SRIDEVI', openTime: '11:30 AM', closeTime: '12:30 PM', type: 'MAIN' },
  { name: 'TIME BAZAR', openTime: '01:00 PM', closeTime: '02:00 PM', type: 'MAIN' },
  { name: 'MADHUR DAY', openTime: '01:30 PM', closeTime: '02:30 PM', type: 'MAIN' },
  { name: 'GOA DAY', openTime: '02:00 PM', closeTime: '03:00 PM', type: 'MAIN' },
  { name: 'MILAN DAY', openTime: '03:00 PM', closeTime: '04:00 PM', type: 'MAIN' },
  { name: 'RAJDHANI DAY', openTime: '03:30 PM', closeTime: '04:30 PM', type: 'MAIN' },
  { name: 'KALYAN', openTime: '04:00 PM', closeTime: '05:00 PM', type: 'MAIN' },
];

const STARLINE = [
  '10:30 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:30 PM', 
  '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'
];

const JACKPOT = [
  '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', 
  '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];

function generatePatti() {
  const digits = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
  digits.sort();
  const patti = digits.join('');
  const ank = (digits.reduce((a, b) => a + b, 0) % 10).toString();
  return { patti, ank };
}

async function seed() {
  console.log('Starting seed...');
  
  // Clear old data
  await db.delete(schema.results);
  await db.delete(schema.marketSchedules);
  await db.delete(schema.markets);
  
  const allMarkets = [];

  // Insert MAIN markets
  for (const game of GAMES) {
    const marketId = uuidv4();
    allMarkets.push(marketId);
    await db.insert(schema.markets).values({
      id: marketId,
      name: game.name,
      slug: game.name.toLowerCase().replace(/ /g, '-'),
      status: 'OPEN',
    });

    for (let day = 0; day <= 6; day++) {
      await db.insert(schema.marketSchedules).values({
        marketId,
        dayOfWeek: day,
        opensAt: game.openTime,
        closesAt: game.closeTime,
      });
    }
  }

  // Insert STARLINE markets
  for (const time of STARLINE) {
    const marketId = uuidv4();
    allMarkets.push(marketId);
    const slug = `starline-${time.toLowerCase().replace(/ /g, '').replace(':', '')}`;
    await db.insert(schema.markets).values({
      id: marketId,
      name: `Starline ${time}`,
      slug,
      status: 'OPEN',
    });

    for (let day = 0; day <= 6; day++) {
      await db.insert(schema.marketSchedules).values({
        marketId,
        dayOfWeek: day,
        opensAt: time,
        closesAt: time,
      });
    }
  }

  // Insert JACKPOT markets
  for (const time of JACKPOT) {
    const marketId = uuidv4();
    allMarkets.push(marketId);
    const slug = `jackpot-${time.toLowerCase().replace(/ /g, '').replace(':', '')}`;
    await db.insert(schema.markets).values({
      id: marketId,
      name: `Jackpot ${time}`,
      slug,
      status: 'OPEN',
    });

    for (let day = 0; day <= 6; day++) {
      await db.insert(schema.marketSchedules).values({
        marketId,
        dayOfWeek: day,
        opensAt: time,
        closesAt: time,
      });
    }
  }

  // Generate fake results for the last 30 days
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    for (const marketId of allMarkets) {
      const open = generatePatti();
      const close = generatePatti();
      const jodi = `${open.ank}${close.ank}`;
      const resultValue = `${open.patti}-${jodi}-${close.patti}`;

      await db.insert(schema.results).values({
        marketId,
        resultDate: dateStr,
        resultValue,
        openPatti: open.patti,
        openAnk: open.ank,
        closeAnk: close.ank,
        closePatti: close.patti,
        status: 'PUBLISHED',
      });
    }
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed();
