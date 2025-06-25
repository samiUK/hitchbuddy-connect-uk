import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure database connection using postgres-js
const queryClient = postgres(process.env.DATABASE_URL, {
  prepare: false,
  ssl: process.env.DATABASE_URL.includes('neon') ? 'require' : false,
});

export const db = drizzle(queryClient, { schema });
