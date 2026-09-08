import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", categoryController.getCategories);
router.post("/", requireAuth, requireRole("admin"), categoryController.postCategory);

export default router;
