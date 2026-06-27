import { readJsonBody, sendJson } from '../shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const { phone, message, key } = await readJsonBody(req);

  if (!phone || !message || !key) {
    sendJson(res, 400, { success: false, error: 'Parameter phone, message dan key diperlukan.' });
    return;
  }

  const body = new URLSearchParams({ phone, message, key });
  const textbeltRes = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await textbeltRes.json();
  sendJson(res, textbeltRes.ok ? 200 : 400, data);
}
