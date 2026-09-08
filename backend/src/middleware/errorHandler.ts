import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { ApiError } from "../utils/http";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, error: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({ success: false, error: "Validation failed", details: err.flatten() });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5MB or smaller" : "Invalid image upload" });
  }

  if (err instanceof Error && err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, error: err.message, details: err.details });
  }

  if (typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000) {
    return res.status(409).json({ success: false, error: "A record with that value already exists" });
  }

  console.error(err);
  return res.status(500).json({ success: false, error: "Something went wrong" });
}
