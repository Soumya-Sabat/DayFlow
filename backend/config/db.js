import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DATABASE_URL } = process.env;

const connectionString =
  DATABASE_URL ||
  (PGHOST && PGUSER && PGPASSWORD && PGDATABASE
    ? `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
    : null);

if (!connectionString) {
  throw new Error("Database configuration is missing. Set DATABASE_URL or PGHOST, PGDATABASE, PGUSER and PGPASSWORD.");
}

export const sql = neon(connectionString);
