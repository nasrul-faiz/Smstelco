import { ensureSchema, pool, sendJson } from './shared';

export default async function handler(_req: any, res: any) {
  try {
    await ensureSchema();
    await pool.query('SELECT 1');
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 500, { ok: false });
  }
}
