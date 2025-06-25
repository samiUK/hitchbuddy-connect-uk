import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure Neon connection with proper serverless configuration
const sql = neon(process.env.DATABASE_URL, {
  arrayMode: false,
  fullResults: false,
});

export const db = drizzle(sql, { schema });
