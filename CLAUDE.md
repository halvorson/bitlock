# BitLock

Brute-force tracker for a 10-button order-independent combination lock (1024
possible combinations, IDs 0–1023). Shows every combination, lets users mark
which ones they've physically tried, and syncs that "tried" state across all
visitors in real time via a shared Redis store.

## Stack

- **Frontend**: single static `index.html` — Tailwind CSS via CDN, no build step,
  no framework. Renders the combo list, handles marking/unmarking, filtering,
  and auto-syncs with the backend.
- **Backend**: two Vercel serverless functions in `api/`
  - `GET /api/state` — returns `{ tried: number[], timestamps: { [id]: number } }`
  - `POST /api/mark` — body `{ id: number, timestamp?: number, undo?: boolean }`,
    marks or unmarks a combo, returns the updated state
- **Storage**: Upstash Redis (via `@vercel/kv` client, which is just a thin
  wrapper around the Upstash REST API). Two keys:
  - `bitlock:tried` — a Redis **Set** of combo IDs that have been tried
  - `bitlock:timestamps` — a Redis **Hash** mapping combo ID → mark timestamp (ms)
- **Hosting**: Vercel, project `gray-duck-llc/bitlock`
- **Routing**: `vercel.json` uses the legacy `builds`/`routes` format. Note the
  route destination must be `/api/$1.js` (not `/api/$1`) — the deployed
  functions are named `api/state.js`/`api/mark.js`, and Vercel does not
  auto-strip the `.js` extension under this legacy config. Omitting `.js`
  silently 404s on `/api/state` while `/api/state.js` still works.

## Why Redis sets/hashes instead of one JSON blob

The original version stored everything as a single JSON blob under one key
and did read-modify-write (`get` → mutate → `set`). That's a race: two users
marking different combos at the same instant could overwrite each other's
write. It now uses atomic `SADD`/`SREM` (set) and `HSET`/`HDEL` (hash)
operations, which Redis applies atomically — no read-modify-write needed.

**Gotcha**: Redis hashes store all values as strings. `kv.hgetall` returns
`{"7": "1717770000000"}`, not `{"7": 1717770000000}`. The frontend calls
`new Date(ts)` on timestamps, and `new Date("1717770000000")` (a numeric
*string*) silently produces `Invalid Date` — only `new Date(1717770000000)`
(an actual number) parses correctly. Both `api/state.js` and `api/mark.js`
must `Number()`-coerce every timestamp before responding, or the "Tried
<time>" labels in the UI silently break.

## Deployment / infrastructure notes

- Originally written for Vercel KV, which is **deprecated**. Storage is now
  an **Upstash Redis** database (free tier) provisioned through the Vercel
  Marketplace (`vercel integration add upstash/upstash-kv`). It auto-injects
  `KV_REST_API_URL` / `KV_REST_API_TOKEN` env vars that `@vercel/kv` expects —
  no code changes needed when migrating off Vercel KV.
- GitHub repo: https://github.com/halvorson/bitlock (private), connected to
  the Vercel project — pushes to `main` auto-deploy to production.
- Live at: https://bitlock.vercel.app

## Local dev

```bash
npm install
vercel link          # one-time, links to the gray-duck-llc/bitlock project
vercel env pull .env.local --yes
vercel dev
```
