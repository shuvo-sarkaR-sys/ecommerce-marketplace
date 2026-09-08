import type { Request, Response } from "express";
import crypto from "node:crypto";
import {
  registerSchema,
  adminRegisterSchema,
  loginSchema,
} from "../validators/auth.validators";
import * as authService from "../services/auth.service";
import { ok, asyncHandler, ApiError } from "../utils/http";
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
} from "../utils/jwt";

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

const googleStateCookie = "luxe_google_oauth_state";

function frontendUrl() {
  return process.env.FRONTEND_URL ?? "http://localhost:3000";
}

function safeNext(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function googleRedirectUri() {
  return `${process.env.BACKEND_URL ?? "http://localhost:5000"}/api/auth/google/callback`;
}

export const googleStart = asyncHandler(async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.redirect(`${frontendUrl()}/login?error=google_not_configured`);

  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(googleStateCookie, JSON.stringify({ state, next: safeNext(req.query.next) }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const storedState = req.cookies?.[googleStateCookie];
  const stateData = storedState ? JSON.parse(storedState) as { state: string; next: string } : null;
  const next = safeNext(stateData?.next);

  res.clearCookie(googleStateCookie, { path: "/" });
  if (!clientId || !clientSecret || !stateData || stateData.state !== req.query.state || !req.query.code) {
    return res.redirect(`${frontendUrl()}/login?error=google_failed`);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: String(req.query.code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return res.redirect(`${frontendUrl()}/login?error=google_failed`);

  const tokens = await tokenResponse.json() as { access_token?: string };
  if (!tokens.access_token) return res.redirect(`${frontendUrl()}/login?error=google_failed`);

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) return res.redirect(`${frontendUrl()}/login?error=google_failed`);

  const profile = await profileResponse.json() as { email?: string; name?: string; email_verified?: boolean };
  if (!profile.email || profile.email_verified !== true) {
    return res.redirect(`${frontendUrl()}/login?error=google_failed`);
  }

  const { accessToken, refreshToken } = await authService.loginWithGoogle({
    email: profile.email,
    name: profile.name ?? profile.email.split("@")[0],
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res.redirect(`${frontendUrl()}${next}`);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerUser(input);
  setAuthCookies(res, accessToken, refreshToken);
  ok(res, { user }, 201);
});

export const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
  const input = adminRegisterSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerAdminUser(input);
  setAuthCookies(res, accessToken, refreshToken);
  ok(res, { user }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginUser(input);
  setAuthCookies(res, accessToken, refreshToken);
  ok(res, { user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: "/" });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  ok(res, { message: "Logged out" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError("Not authenticated", 401);

  const { accessToken, refreshToken } = await authService.rotateSession(token);
  setAuthCookies(res, accessToken, refreshToken);
  ok(res, { message: "Session refreshed" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  const user = await authService.getCurrentUser(req.user.sub);
  ok(res, { user });
});
