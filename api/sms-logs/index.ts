import { ensureSchema, pool, readJsonBody, sendJson } from '../shared';

export default async function handler(req: any, res: any) {
  await ensureSchema();

  if (req.method === 'GET') {
    const rawLimit = Number(req.query?.limit ?? 100);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(500, rawLimit)) : 100;

    const result = await pool.query(
      `SELECT id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at
       FROM sms_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    sendJson(res, 200, result.rows);
    return;
  }

  if (req.method === 'POST') {
    const {
      phone,
      message,
      api_key_hint = '',
      status = 'PENDING',
      text_id = '',
      quota_remaining = -1,
      error = '',
    } = await readJsonBody(req);

    if (!phone || !message) {
      sendJson(res, 400, { error: 'phone and message are required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO sms_logs (phone, message, api_key_hint, status, text_id, quota_remaining, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at`,
      [phone, message, api_key_hint, status, text_id, quota_remaining, error]
    );

    sendJson(res, 201, result.rows[0]);
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
}
