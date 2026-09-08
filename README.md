# MAISON — Luxury Fashion Marketplace

A Next.js frontend and a separate Express/MongoDB backend, built as two
independently deployable apps (matching the target stack: frontend on
Vercel, backend on Render/Railway). This is **Phase 1**: architecture,
design system, database models, auth, product/category/brand APIs, and the
homepage. See each app's own README for details; this file covers how they
fit together.

```
frontend/   Next.js 15 App Router app -- see frontend/README.md
backend/    Express + TypeScript + MongoDB REST API -- see backend/README.md
```

## Running both locally

```bash
# Terminal 1 -- backend
cd backend
npm install
cp .env.example .env      # fill in MONGODB_URI, JWT secrets, FRONTEND_URL
# No demo data is created automatically.
npm run dev                # http://localhost:5000

# Terminal 2 -- frontend
cd frontend
npm install
cp .env.example .env.local   # BACKEND_URL=http://localhost:5000
npm run dev                  # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

## How the split works

The frontend never talks to MongoDB or holds JWT secrets — everything
data-related goes through the backend's REST API. Two mechanisms make that
work cleanly across both dev and a real cross-domain production deployment:

1. **`/api/*` rewrite proxy** (`frontend/next.config.ts`) — any
   browser-originated call to `/api/...` on the frontend is transparently
   forwarded server-side to the backend. From the browser's point of view it
   never leaves the frontend's origin, so cookies the backend sets stay
   scoped to the frontend's domain instead of becoming a fragile cross-site
   cookie once frontend and backend are on different production domains
   (`*.vercel.app` vs `*.onrender.com`).
2. **Server Components fetch the backend directly** (`frontend/lib/data/`)
   — that hop is server-to-server and never touches the browser, so it
   skips the proxy and just calls `BACKEND_URL` directly, with Next's data
   cache (`next: { revalidate }`) instead of Mongoose queries.

`frontend/middleware.ts` guards `/account`, `/seller`, `/admin` by
forwarding the incoming request's cookies to the backend's `/api/auth/me`
and trusting its answer, rather than verifying the JWT itself — the
frontend deliberately never holds the signing secret, since sharing it back
across the split would undercut the point of separating the two apps.

## What's not built yet

Same as the previous single-app phase — see the "What's not built yet"
section in `frontend/README.md` for the full list (shop listing, PDP, cart,
checkout, seller/admin dashboards, payments, SEO, AI features).
