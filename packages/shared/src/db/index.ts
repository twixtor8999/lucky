import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'dns';

// Ensure reliable IPv4 resolution
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_pvXWTqZz9Il6@ep-winter-band-azaacg41-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.includes('127.0.0.1'))
  ? process.env.DATABASE_URL
  : DEFAULT_DB_URL;

// Connection pool for queries - robust connection to Neon DB (standard port 5432)
export const client = postgres(connectionString, { 
  max: 10,
  idle_timeout: 30,
  connect_timeout: 30,
  prepare: false,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });

export * from './schema';
