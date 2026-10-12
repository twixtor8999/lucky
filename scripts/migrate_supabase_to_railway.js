const postgres = require('postgres');

const SUPABASE_URL = "postgresql://postgres.bkrhitxygmrpvxxrfsya:RaviChandra%402026@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres";
const RAILWAY_URL = "postgresql://postgres:xdrlawSetyvdqWOdHuEMYulezKyAbyUz@iriguchi.proxy.rlwy.net:32273/railway";

async function migrateData() {
  const src = postgres(SUPABASE_URL, { max: 1 });
  const dst = postgres(RAILWAY_URL, { max: 1 });

  console.log('--- STARTING ROW-LEVEL MIGRATION FROM SUPABASE TO RAILWAY ---');

  // Ordered by foreign key dependency
  const tables = [
    'app_settings',
    'system_settings',
    'users',
    'wallets',
    'markets',
    'market_schedules',
    'results',
    'mpins',
    'bets',
    'ledger_entries',
    'transactions',
    'deposits',
    'withdrawals',
    'notifications',
    'support_tickets',
    'support_messages',
    'bonus_campaigns',
    'bonus_claims',
    'audit_logs',
    'otp_verifications',
    'sessions'
  ];

  for (const table of tables) {
    try {
      const rows = await src`SELECT * FROM ${src(table)}`;
      console.log(`Table "${table}": found ${rows.length} rows in Supabase.`);

      if (rows.length > 0) {
        // Clear destination table first to prevent duplicate primary keys
        await dst`DELETE FROM ${dst(table)}`;
        // Batch insert rows
        await dst`INSERT INTO ${dst(table)} ${dst(rows)}`;
        console.log(`Table "${table}": successfully transferred ${rows.length} rows to Railway!`);
      }
    } catch (err) {
      console.error(`Error migrating table "${table}":`, err.message);
    }
  }

  await src.end();
  await dst.end();
  console.log('--- ALL TABLES MIGRATED SUCCESSFULLY ---');
}

migrateData().catch(err => {
  console.error('Migration Fatal Error:', err);
  process.exit(1);
});
