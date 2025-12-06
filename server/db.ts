import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import * as freightSchema from "@shared/freight-schema";
import * as securitySchema from "./db/schema/security-audit-schema";
import * as market360Schema from "@shared/market360-schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Production-ready connection pooling configuration for Neon PostgreSQL
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // SSL configuration for Neon cloud database
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  
  // Connection pool sizing
  max: 20, // Maximum pool size - conservative for serverless
  min: 2, // Minimum idle connections - keeps warm connections
  
  // Timeouts (in milliseconds)
  connectionTimeoutMillis: 30000, // 30 seconds to establish connection
  idleTimeoutMillis: 10000, // 10 seconds before idle connection is closed (serverless efficiency)
  statement_timeout: 60000, // 60 seconds max query execution time
  
  // Application name for monitoring
  application_name: 'wizards-incubator-platform',
  
  // Keep alive for long-running connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Initialize connection pool
export const pool = new Pool(poolConfig);

// Pool event handlers for monitoring and debugging
pool.on('connect', (client) => {
  console.log('[DB Pool] New client connected');
});

pool.on('acquire', (client) => {
  // Connection acquired from pool - useful for debugging connection leaks
});

pool.on('remove', (client) => {
  console.log('[DB Pool] Client removed from pool');
});

pool.on('error', (err, client) => {
  console.error('[DB Pool] Unexpected error on idle client:', err);
});

// Initialize Drizzle ORM with connection pool (includes security audit and Market360 schemas)
export const db = drizzle(pool, { schema: { ...schema, ...freightSchema, ...securitySchema, ...market360Schema } });

// Export pool stats helper for monitoring
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}
