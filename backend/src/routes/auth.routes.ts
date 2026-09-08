import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/admin/register", authController.registerAdmin);
router.post("/login", authController.login);
router.get("/google", authController.googleStart);
router.get("/google/callback", authController.googleCallback);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/me", requireAuth, authController.me);

export default router;
