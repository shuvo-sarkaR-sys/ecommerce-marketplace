import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, ACCESS_COOKIE_NAME } from "../utils/jwt";
import { ApiError } from "../utils/http";
import type { UserRole } from "../models/User";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!token) return next(new ApiError("Not authenticated", 401));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new ApiError("Invalid or expired session", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError("Not authenticated", 401));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You don't have permission to do that", 403));
    }
    next();
  };
}
