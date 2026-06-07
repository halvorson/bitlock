import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [tried, timestamps] = await Promise.all([
      kv.smembers('bitlock:tried'),
      kv.hgetall('bitlock:timestamps'),
    ]);

    return res.status(200).json({
      tried: tried.map(Number),
      timestamps: timestamps || {},
    });
  } catch (err) {
    console.error('GET /api/state error:', err);
    return res.status(500).json({ error: 'Failed to load state' });
  }
}
