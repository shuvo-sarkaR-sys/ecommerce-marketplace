import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as cartController from "../controllers/cart.controller";

const router = Router();

router.use(requireAuth);
router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.patch("/items/:slug", cartController.updateItem);
router.delete("/items/:slug", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;