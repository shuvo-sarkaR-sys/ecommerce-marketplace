# MAISON — Frontend

Next.js 15 (App Router) frontend for the MAISON marketplace. This app holds
no database connection and no JWT secrets — all of that lives in
`../backend`. See the root README for how the two apps talk to each other.

## Getting started

```bash
npm install
cp .env.example .env.local
```

Set **BACKEND_URL** in `.env.local` to wherever the backend is running
(`http://localhost:5000` in dev). Then, with the backend already running:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  layout.tsx, page.tsx, globals.css, providers.tsx
components/
  ui/          Button, LinkButton, Input, Badge, Price, ImagePlaceholder
  layout/      Header, MegaMenu, Footer
  home/        Hero, FeaturedCategories, NewArrivals, TrendingBrands,
               Editorial, TrendingProducts, StyleInspiration, Newsletter
  product/     ProductCard
lib/
  utils.ts           cn(), formatBDT(), slugify(), percentOff()
  data/home.ts       Server-only fetchers that call the backend's REST API
types/
  product.ts         Client-facing types mirrored from the backend's models
middleware.ts        Route guard for /account, /seller, /admin -- delegates
                      the actual auth check to the backend (see root README)
next.config.ts       /api/* rewrite proxy to the backend
```

## Design system

- **Color:** Ivory `#F6F3EC` background, Paper `#FBFAF7` surfaces, Ink `#201E1B` /
  Charcoal `#3A362F` text, Stone `#8C8474` muted/borders, Sand `#E4DCC9` dividers,
  Oxblood `#7A3524` as the single accent (sale tags only).
- **Type:** Fraunces (serif) for display/headings, Work Sans (sans) for nav, body,
  forms, buttons.
- **Shape:** near-zero border radius, hairline (1px) dividers instead of card
  shadows — see `tailwind.config.ts` and `app/globals.css`.
- Product photography is stubbed with `components/ui/ImagePlaceholder.tsx` (a CSS
  gradient block) rather than stock photos — swap it for `next/image` against
  Cloudinary URLs once real product images exist; every call site already reads
  from `product.images[0]`.

## What's not built yet

Following the original spec's build order, still to come:

- **Shop listing** (`/shop`) — filters, sorting, pagination
- **Product detail page** (`/product/[slug]`) — gallery, size/color selection,
  reviews
- **Search** — full-text is already indexed on the backend's `Product` model
  (name/description/tags) and the `?q=` param works against
  `/api/products`; the search UI/overlay isn't built
- **Cart, wishlist, checkout** — backend models exist; API routes and UI don't yet
- **Customer account dashboard** (`/account`)
- **Seller dashboard** (`/seller`) — product management, orders, analytics
- **Admin dashboard** (`/admin`) — seller/product approval, categories, coupons,
  commission config
- **Payments** (bKash/Nagad/COD/card abstraction), **shipping** status tracking,
  **notifications**, **coupons**
- **SEO**: sitemap.xml, robots.txt, JSON-LD (Product/Offer/Organization schemas)
- **AI assistant / recommendations / visual search** architecture

`middleware.ts` already guards `/account`, `/seller`, `/admin` by role, so those
routes are ready to receive pages as each phase is built.
