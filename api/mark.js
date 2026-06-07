import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, timestamp, undo } = req.body;

  if (typeof id !== 'number' || id < 0 || id > 1023) {
    return res.status(400).json({ error: 'Invalid combo id' });
  }

  try {
    if (undo) {
      await Promise.all([
        kv.srem('bitlock:tried', id),
        kv.hdel('bitlock:timestamps', String(id)),
      ]);
    } else {
      await Promise.all([
        kv.sadd('bitlock:tried', id),
        kv.hset('bitlock:timestamps', { [id]: timestamp || Date.now() }),
      ]);
    }

    const [tried, timestamps] = await Promise.all([
      kv.smembers('bitlock:tried'),
      kv.hgetall('bitlock:timestamps'),
    ]);

    return res.status(200).json({
      tried: tried.map(Number),
      timestamps: timestamps || {},
    });
  } catch (err) {
    console.error('POST /api/mark error:', err);
    return res.status(500).json({ error: 'Failed to update state' });
  }
}
