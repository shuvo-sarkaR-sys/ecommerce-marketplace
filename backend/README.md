# MAISON API (Backend)

Express + TypeScript + MongoDB REST API for the MAISON marketplace. See the
root README for how this fits together with the `frontend/` app.

## Structure

```
src/
  server.ts            Entry point: loads env, connects DB, starts listening
  app.ts               Express app: helmet, CORS, rate limiting, route mounting
  config/loadEnv.ts     Manual .env parser (avoids the dotenv package)
  db/connect.ts         Mongoose connection
  models/               User, Category, Brand, Product, Cart, Order, Review, Wishlist
  validators/            Zod request schemas
  services/              Business logic (auth, product, category, brand)
  controllers/           Thin request/response handlers, call into services
  routes/                Express routers, mounted under /api
  middleware/            requireAuth / requireRole, central error handler
  utils/                 JWT, password hashing, slugify, response helpers
scripts/clear-data.ts    Explicitly confirmation-gated database reset
```

## Getting started

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- **MONGODB_URI** — free-tier cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **JWT_ACCESS_SECRET** / **JWT_REFRESH_SECRET** — two different long random strings (`openssl rand -base64 48`)
- **FRONTEND_URL** — where the Next.js app runs (`http://localhost:3000` in dev); required for CORS
- **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_API_SECRET** — required for product image uploads

```bash
npm run clear-data   # only with CONFIRM_CLEAR_DATA=YES; deletes every collection
npm run dev    # http://localhost:5000, restarts on change via tsx watch
```

Production: `npm run build` (tsc → `dist/`) then `npm start`.

## API

All routes are mounted under `/api`. `GET /health` is unauthenticated and
returns `{ status: "ok" }` for uptime checks.

| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/auth/register` | POST | — | Sets access + refresh cookies |
| `/api/auth/admin/register` | POST | setup key | Creates an admin account when `ADMIN_SETUP_KEY` matches |
| `/api/auth/login` | POST | — | Sets access + refresh cookies |
| `/api/auth/logout` | POST | — | Clears cookies |
| `/api/auth/refresh` | POST | refresh cookie | Rotates both tokens |
| `/api/auth/me` | GET | access cookie | Current user |
| `/api/products` | GET | — | Filters: `category`, `brand`, `color`, `size`, `minPrice`, `maxPrice`, `minRating`, `q`, `sort`, `page`, `limit` |
| `/api/products/:slug` | GET | — | Increments view count |
| `/api/products` | POST | seller/admin | Creates a product under the caller's own brand (`pending` until approved) |
| `/api/categories` | GET | — | |
| `/api/categories` | POST | admin | |
| `/api/brands` | GET | — | `?status=all` for every status (admin use) |
| `/api/brands` | POST | any authenticated user | Seller onboarding — creates a `pending` brand |

## Auth & cookies

Access tokens (15 min) and refresh tokens (30 days) are separate httpOnly
cookies. `sameSite` is `"lax"` outside production (works fine for
frontend↔backend calls on `localhost`, since browsers scope cookies by
hostname, not port) and `"none"` (with `secure: true`, requiring HTTPS) in
production, since the frontend and backend will sit on different domains
there. See the root README for how the frontend proxies requests so these
cookies stay usable across that split.

`middleware/auth.ts` exports `requireAuth` (attaches `req.user`) and
`requireRole(...roles)` (403s if the role doesn't match) — compose them on
any route, as seen in `routes/product.routes.ts`.
