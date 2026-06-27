import { Pool } from 'pg';

declare const process: {
  env: Record<string, string | undefined>;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Set it in the Vercel environment variables.');
}

export const pool = new Pool({ connectionString: databaseUrl });

let schemaPromise: Promise<void> | null = null;

export function ensureSchema() {
  schemaPromise ??= (async () => {
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        phone text NOT NULL,
        message text NOT NULL,
        api_key_hint text DEFAULT '',
        status text NOT NULL DEFAULT 'PENDING',
        text_id text DEFAULT '',
        quota_remaining integer DEFAULT -1,
        error text DEFAULT '',
        created_at timestamptz DEFAULT now()
      );
    `);
  })();

  return schemaPromise;
}

export function sendJson(res: any, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function sendEmpty(res: any, statusCode: number) {
  res.statusCode = statusCode;
  res.end();
}

export async function readJsonBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.length > 0) {
    return JSON.parse(req.body);
  }

  return {};
}
