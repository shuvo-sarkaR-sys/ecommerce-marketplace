import type { Request, Response } from "express";
import { createProductSchema } from "../validators/product.validators";
import * as productService from "../services/product.service";
import { ok, asyncHandler, ApiError } from "../utils/http";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts(
    req.query as productService.ProductListQuery,
  );
  ok(res, result);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug as string);
  ok(res, { product });
});

export const postProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(req.user.sub, req.user.role, input);
  ok(res, { product }, 201);
});
