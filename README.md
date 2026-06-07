# BitLock

Brute-force tracker for a 10-button order-independent combination lock (1024 combinations). Shared state across all users via Redis.

## Deploy in ~5 minutes

### 1. Install Vercel CLI (if needed)
```bash
npm i -g vercel
```

### 2. Deploy
```bash
cd bitlock
vercel
```
Follow the prompts — create a new project, accept defaults.

### 3. Add a Redis database
Vercel KV is deprecated. Use the Marketplace instead:
```bash
vercel integration add upstash/upstash-kv
```
This provisions an Upstash Redis database (free tier available), connects it to
the project, and auto-injects `KV_REST_API_URL` / `KV_REST_API_TOKEN` (the env
vars `@vercel/kv` expects) — no code changes needed.

### 4. Redeploy to pick up env vars
```bash
vercel --prod
```

That's it — your app is live and shared state works.

## Local dev
```bash
npm install
vercel dev
```
(Requires `vercel link` and the env vars pulled via `vercel env pull .env.local`)

## Project structure
```
bitlock/
├── index.html        # Full UI (Tailwind CSS via CDN)
├── api/
│   ├── state.js      # GET  /api/state  — returns tried set + timestamps
│   └── mark.js       # POST /api/mark   — marks or unmarks a combo
├── vercel.json       # Routing config
└── package.json
```

## API
**GET /api/state**
Returns `{ tried: number[], timestamps: { [id]: number } }`

**POST /api/mark**
Body: `{ id: number, timestamp: number, undo: boolean }`
Returns updated state.
