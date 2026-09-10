import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadProductImages } from "../controllers/admin.controller";

const router = Router();
router.use(requireAuth, requireRole("admin"));
router.get("/overview", adminController.overview);
router.post("/uploads/products", uploadProductImages);
router.post("/uploads/brand", adminController.uploadBrandImageFile);
router.get("/resources/:resource", adminController.resource);
router.patch("/brands/:id/status", adminController.updateBrandStatus);
router.patch("/brands/:id", adminController.updateBrand);
router.patch("/products/:id/status", adminController.updateProductStatus);
router.patch("/products/:id", adminController.updateProduct);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

export default router;