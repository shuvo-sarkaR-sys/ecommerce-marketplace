import type { Request, Response } from "express";
import { onboardBrandSchema } from "../validators/catalog.validators";
import * as brandService from "../services/brand.service";
import { ok, asyncHandler, ApiError } from "../utils/http";

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  // Public storefront callers only ever see approved brands; ?status=all is
  // intended for the admin dashboard (added in a later phase).
  const includeAll = req.query.status === "all";
  const brands = await brandService.listBrands(includeAll);
  ok(res, { brands });
});

export const postBrand = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError("Not authenticated", 401);
  const input = onboardBrandSchema.parse(req.body);
  const brand = await brandService.onboardBrand(req.user.sub, input);
  ok(res, { brand }, 201);
});
