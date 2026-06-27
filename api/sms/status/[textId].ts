import { sendJson } from '../../_lib';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const textId = String(req.query?.textId ?? '').trim();

  if (!textId) {
    sendJson(res, 400, { error: 'textId diperlukan' });
    return;
  }

  const textbeltRes = await fetch(`https://textbelt.com/status/${encodeURIComponent(textId)}`);
  const data = await textbeltRes.json();
  sendJson(res, textbeltRes.ok ? 200 : 400, data);
}
