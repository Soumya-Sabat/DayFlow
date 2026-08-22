import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, DATABASE_URL } = process.env;

const connectionString =
  DATABASE_URL ||
  (PGHOST && PGUSER && PGPASSWORD && PGDATABASE
    ? `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
    : null);

// creates a SQL connection using our env variables, or dummy query handler if not set
export const sql = connectionString
  ? neon(connectionString)
  : (async () => []);