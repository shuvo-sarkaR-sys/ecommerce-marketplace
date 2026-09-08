import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import * as adminService from "../services/admin.service";
import { asyncHandler, ok } from "../utils/http";

const uploadDirectory = path.join(process.cwd(), "uploads", "products");
fs.mkdirSync(uploadDirectory, { recursive: true });
const productUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${extension}`);
    },
  }),
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

export const uploadProductImages = [
  productUpload.array("images", 6),
  asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) return res.status(400).json({ success: false, error: "Select at least one image" });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    ok(res, { images: files.map((file) => `${baseUrl}/uploads/products/${file.filename}`) }, 201);
  }),
];

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await adminService.getOverview());
});

export const updateBrandStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, { brand: await adminService.updateBrandStatus(req.params.id, req.body.status) });
});

export const updateProductStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, { product: await adminService.updateProductStatus(req.params.id, req.body.status) });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  ok(res, { product: await adminService.updateProduct(req.params.id, req.body) });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, { order: await adminService.updateOrderStatus(req.params.id, req.body.status) });
});

export const resource = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await adminService.listResource(req.params.resource));
});