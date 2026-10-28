import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'dns';

// Ensure reliable IPv4 resolution
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const DEFAULT_DB_URL = 'postgresql://postgres:xdrlawSetyvdqWOdHuEMYulezKyAbyUz@iriguchi.proxy.rlwy.net:32273/railway';

const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.includes('127.0.0.1'))
  ? process.env.DATABASE_URL
  : DEFAULT_DB_URL;

// Connection pool for queries - robust connection to Railway production DB
export const client = postgres(connectionString, { 
  max: 10,
  idle_timeout: 30,
  connect_timeout: 30,
  prepare: false,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(client, { schema });

export * from './schema';
