import type { Request, Response } from "express";
import multer from "multer";
import * as adminService from "../services/admin.service";
import { asyncHandler, ok } from "../utils/http";
import { uploadProductImage } from "../config/cloudinary";
import { updateBrandSchema } from "../validators/catalog.validators";

const productUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 6, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }
    callback(null, true);
  },
});

export const uploadProductImages = [
  productUpload.array("images", 6),
  asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) return res.status(400).json({ success: false, error: "Select at least one image" });
    const images = await Promise.all(files.map((file) => uploadProductImage(file.buffer)));
    ok(res, { images }, 201);
  }),
];

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await adminService.getOverview());
});

export const updateBrandStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, { brand: await adminService.updateBrandStatus(req.params.id, req.body.status) });
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBrandSchema.parse(req.body);
  ok(res, { brand: await adminService.updateBrand(req.params.id, input) });
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