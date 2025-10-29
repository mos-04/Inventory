import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Require DATABASE_URL; this app exclusively uses the database for storage
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. This app requires a database connection.");
}

const { Pool } = pg;
export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
