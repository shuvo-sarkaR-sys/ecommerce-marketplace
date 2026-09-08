import { Router } from "express";
import * as brandController from "../controllers/brand.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", brandController.getBrands);
router.post("/", requireAuth, brandController.postBrand);

export default router;
