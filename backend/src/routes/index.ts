import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import brandRoutes from "./brand.routes";
import orderRoutes from "./order.routes";
import adminRoutes from "./admin.routes";
import accountRoutes from "./account.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/account", accountRoutes);

export default router;
