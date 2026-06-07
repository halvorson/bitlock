# BitLock

Brute-force tracker for a 10-button order-independent combination lock (1024 combinations). Shared state across all users via Vercel KV.

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

### 3. Add Vercel KV
In the Vercel dashboard for your project:
1. Go to **Storage** → **Create Database** → **KV**
2. Name it anything (e.g. `bitlock-kv`)
3. Click **Connect** to link it to your project
4. Vercel auto-injects `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` env vars

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
(Requires `vercel link` and the KV env vars pulled via `vercel env pull .env.local`)

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
