import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async rewrites() {
    return [
      // Makes every browser-originated call to /api/* look same-origin to
      // the frontend, so cookies the backend sets on the (proxied) response
      // are scoped to the frontend's own domain -- this is what lets
      // middleware.ts and client-side fetch("/api/...") calls keep working
      // once the frontend and backend are deployed on different domains
      // (Vercel + Render/Railway). Server Components fetch the backend
      // directly instead (see lib/data/home.ts) since that hop never goes
      // through the browser.
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
