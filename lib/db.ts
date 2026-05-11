import { Pool } from "pg";

const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT || "5432"),
  database: process.env.SUPABASE_DB,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const SCHEMA = process.env.SUPABASE_SCHEMA || "prepvicta";

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO ${SCHEMA}`);
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export { pool, SCHEMA };
