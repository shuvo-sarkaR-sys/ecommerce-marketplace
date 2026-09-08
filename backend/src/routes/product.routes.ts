import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", productController.getProducts);
router.get("/:slug", productController.getProductBySlug);
router.post("/", requireAuth, requireRole("seller", "admin"), productController.postProduct);

export default router;
