import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'dns';

// Ensure Neon hostnames resolve reliably across all networks (e.g. if local Wi-Fi router DNS refuses external subdomains)
if (process.env.NODE_ENV !== 'production' && typeof dns !== 'undefined' && (dns as any).lookup) {
  const origLookup = dns.lookup.bind(dns);
  const dnsPromises = dns.promises;
  try {
    dnsPromises.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {}

  // @ts-ignore
  (dns as any).lookup = function (hostname: any, options: any, callback: any) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    origLookup(hostname, options, async (err: any, address: any, family: any) => {
      if (!err && address) {
        return callback(null, address, family);
      }
      try {
        const ips = await dnsPromises.resolve4(hostname);
        if (options && options.all) {
          return callback(null, ips.map((ip: string) => ({ address: ip, family: 4 })));
        }
        return callback(null, ips[0], 4);
      } catch (fallbackErr) {
        return callback(err || fallbackErr);
      }
    });
  };
}

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_pvXWTqZz9Il6@ep-winter-band-azaacg41-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.includes('127.0.0.1'))
  ? process.env.DATABASE_URL
  : DEFAULT_NEON_URL;

// Connection pool for queries - optimized for serverless and Neon pooler
export const client = postgres(connectionString, { 
  max: 5,
  idle_timeout: 15,
  connect_timeout: 5,
  prepare: false,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(client, { schema });

export * from './schema';
