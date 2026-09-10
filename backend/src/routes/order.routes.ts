import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, orderController.getMyOrders);
router.post("/checkout", requireAuth, orderController.createOrder);

export default router;
