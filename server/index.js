import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 8787);
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Add it in .env for Neon connection.');
}

const pool = new Pool({ connectionString: databaseUrl });

async function ensureSchema() {
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
}

app.post('/api/sms/send', async (req, res) => {
  const { phone, message, key } = req.body ?? {};

  if (!phone || !message || !key) {
    return res.status(400).json({ success: false, error: 'Parameter phone, message dan key diperlukan.' });
  }

  const body = new URLSearchParams({ phone, message, key });
  const textbeltRes = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await textbeltRes.json();
  return res.status(textbeltRes.ok ? 200 : 400).json(data);
});

app.get('/api/sms/status/:textId', async (req, res) => {
  const textId = req.params.textId;

  if (!textId) {
    return res.status(400).json({ error: 'textId diperlukan' });
  }

  const textbeltRes = await fetch(`https://textbelt.com/status/${encodeURIComponent(textId)}`);
  const data = await textbeltRes.json();
  return res.status(textbeltRes.ok ? 200 : 400).json(data);
});

app.get('/api/sms/quota/:key', async (req, res) => {
  const key = req.params.key;

  if (!key) {
    return res.status(400).json({ error: 'key diperlukan' });
  }

  const textbeltRes = await fetch(`https://textbelt.com/quota/${encodeURIComponent(key)}`);
  const data = await textbeltRes.json();
  return res.status(textbeltRes.ok ? 200 : 400).json(data);
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.get('/api/sms-logs', async (req, res) => {
  const rawLimit = Number(req.query.limit ?? 100);
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, rawLimit)) : 100;

  const result = await pool.query(
    `SELECT id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at
     FROM sms_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  res.json(result.rows);
});

app.post('/api/sms-logs', async (req, res) => {
  const {
    phone,
    message,
    api_key_hint = '',
    status = 'PENDING',
    text_id = '',
    quota_remaining = -1,
    error = '',
  } = req.body ?? {};

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  const result = await pool.query(
    `INSERT INTO sms_logs (phone, message, api_key_hint, status, text_id, quota_remaining, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at`,
    [phone, message, api_key_hint, status, text_id, quota_remaining, error]
  );

  return res.status(201).json(result.rows[0]);
});

app.patch('/api/sms-logs/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const result = await pool.query(
    `UPDATE sms_logs
     SET status = $1
     WHERE id = $2
     RETURNING id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at`,
    [status, id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: 'log not found' });
  }

  return res.json(result.rows[0]);
});

app.delete('/api/sms-logs/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM sms_logs WHERE id = $1', [id]);
  return res.status(204).send();
});

(async () => {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`Neon API listening on http://localhost:${port}`);
  });
})();
