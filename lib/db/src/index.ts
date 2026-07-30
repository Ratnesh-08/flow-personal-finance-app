import dotenv from "dotenv";
import path from "node:path";

// Load the .env from the workspace root
dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
});

console.log("Loaded from:", path.resolve(process.cwd(), "../../.env"));
console.log("DATABASE_URL:", !!process.env.DATABASE_URL);

console.log("CWD:", process.cwd());
console.log("DATABASE_URL:", !!process.env.DATABASE_URL);

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
