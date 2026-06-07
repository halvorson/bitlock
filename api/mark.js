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
    // Load current state
    const current = (await kv.get('bitlock:state')) || { tried: [], timestamps: {} };
    let tried = new Set(current.tried.map(Number));
    let timestamps = current.timestamps || {};

    if (undo) {
      tried.delete(id);
      delete timestamps[id];
    } else {
      tried.add(id);
      timestamps[id] = timestamp || Date.now();
    }

    const next = { tried: [...tried], timestamps };
    await kv.set('bitlock:state', next);

    return res.status(200).json(next);
  } catch (err) {
    console.error('POST /api/mark error:', err);
    return res.status(500).json({ error: 'Failed to update state' });
  }
}
