import { ensureSchema, pool, readJsonBody, sendEmpty, sendJson } from '../_lib';

const smsLogColumns = 'id, phone, message, api_key_hint, status, text_id, quota_remaining, error, created_at';

export default async function handler(req: any, res: any) {
  await ensureSchema();

  if (req.method === 'PATCH') {
    const { id } = req.query ?? {};
    const { status } = await readJsonBody(req);

    if (!status) {
      sendJson(res, 400, { error: 'status is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE sms_logs
       SET status = $1
       WHERE id = $2
       RETURNING ${smsLogColumns}`,
      [status, id]
    );

    if (!result.rows[0]) {
      sendJson(res, 404, { error: 'log not found' });
      return;
    }

    sendJson(res, 200, result.rows[0]);
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.query ?? {};
    await pool.query('DELETE FROM sms_logs WHERE id = $1', [id]);
    sendEmpty(res, 204);
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
}
