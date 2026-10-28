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

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5454/zenvora?sslmode=disable';

// Connection pool for queries
export const client = postgres(connectionString, { 
  max: 10,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(client, { schema });

export * from './schema';
