import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}

const ACCESS_TOKEN_TTL = "15d";
const REFRESH_TOKEN_TTL = "15d";

function getSecrets() {
  const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  if (
    !ACCESS_SECRET ||
    !REFRESH_SECRET ||
    ACCESS_SECRET.length < 32 ||
    REFRESH_SECRET.length < 32 ||
    ACCESS_SECRET.startsWith("replace-") ||
    REFRESH_SECRET.startsWith("replace-")
  ) {
    throw new Error(
      "JWT secrets must be different random values of at least 32 characters. Set them in .env (see .env.example).",
    );
  }
  return { ACCESS_SECRET, REFRESH_SECRET };
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const { ACCESS_SECRET } = getSecrets();
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const { REFRESH_SECRET } = getSecrets();
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const { ACCESS_SECRET } = getSecrets();
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const { REFRESH_SECRET } = getSecrets();
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

export const ACCESS_COOKIE_NAME = "luxe_access_token";
export const REFRESH_COOKIE_NAME = "luxe_refresh_token";

/**
 * SameSite="none" is required once the frontend and backend live on
 * different domains in production (the browser treats the API call as
 * cross-site). Locally, both run on "localhost" -- browsers scope cookies by
 * hostname only (not port), so "lax" works fine there and avoids needing
 * "secure" (which requires HTTPS) during plain http:// development.
 */
const isProd = process.env.NODE_ENV === "production";

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 15,
  };
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/api/auth",
    maxAge: 1000 * 60 * 60 * 24 * 15,
  };
}
