import type { Request, Response } from "express";
import { createCategorySchema } from "../validators/catalog.validators";
import * as categoryService from "../services/category.service";
import { ok, asyncHandler } from "../utils/http";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  ok(res, { categories });
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  ok(res, { category }, 201);
});
