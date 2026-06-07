import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await kv.get('bitlock:state');
    if (!data) {
      return res.status(200).json({ tried: [], timestamps: {} });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('GET /api/state error:', err);
    return res.status(500).json({ error: 'Failed to load state' });
  }
}
