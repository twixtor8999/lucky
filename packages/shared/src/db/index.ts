import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5454/zenvora?sslmode=disable';

// Connection pool for queries
export const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

export * from './schema';
