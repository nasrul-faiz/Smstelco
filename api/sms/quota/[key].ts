import { sendJson } from '../../_lib';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const key = String(req.query?.key ?? '').trim();

  if (!key) {
    sendJson(res, 400, { error: 'key diperlukan' });
    return;
  }

  const textbeltRes = await fetch(`https://textbelt.com/quota/${encodeURIComponent(key)}`);
  const data = await textbeltRes.json();
  sendJson(res, textbeltRes.ok ? 200 : 400, data);
}
