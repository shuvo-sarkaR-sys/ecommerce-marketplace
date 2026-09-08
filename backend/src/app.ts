import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import routes from "./routes";
import { notFound, errorHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";
  const apiRateLimit = Number(process.env.API_RATE_LIMIT_MAX ?? (isProduction ? 300 : 1000));
  const authRateLimit = Number(process.env.AUTH_RATE_LIMIT_MAX ?? (isProduction ? 30 : 100));

  app.set("trust proxy", 1);
  app.use(helmet());

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Generous global ceiling against abuse; auth endpoints get a tighter one
  // below since they're the more attractive brute-force target.
  app.use(
    "/api",
    rateLimit({ windowMs: 15 * 60 * 1000, max: apiRateLimit, standardHeaders: true, legacyHeaders: false }),
  );
  app.use(
    "/api/auth",
    rateLimit({ windowMs: 15 * 60 * 1000, max: authRateLimit, standardHeaders: true, legacyHeaders: false }),
  );

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
