import type { Request, Response } from "express";
import multer from "multer";
import * as adminService from "../services/admin.service";
import { asyncHandler, ok } from "../utils/http";
import { uploadBrandImage, uploadProductImage } from "../config/cloudinary";
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

const brandUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
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

export const uploadBrandImageFile = [
  brandUpload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: "Select a brand image" });
    ok(res, { image: await uploadBrandImage(file.buffer) }, 201);
  }),
];

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await adminService.getOverview());
});

export const updateBrandStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ success: false, error: "Invalid brand id" });
  ok(res, { brand: await adminService.updateBrandStatus(id, req.body.status) });
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const input = updateBrandSchema.parse(req.body);
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ success: false, error: "Invalid brand id" });
  ok(res, { brand: await adminService.updateBrand(id, input) });
});

export const updateProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ success: false, error: "Invalid product id" });
  ok(res, { product: await adminService.updateProductStatus(id, req.body.status) });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ success: false, error: "Invalid product id" });
  ok(res, { product: await adminService.updateProduct(id, req.body) });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ success: false, error: "Invalid order id" });
  ok(res, { order: await adminService.updateOrderStatus(id, req.body.status) });
});

export const resource = asyncHandler(async (req: Request, res: Response) => {
  const resource = req.params.resource;
  if (typeof resource !== "string") return res.status(400).json({ success: false, error: "Invalid resource" });
  ok(res, await adminService.listResource(resource));
});