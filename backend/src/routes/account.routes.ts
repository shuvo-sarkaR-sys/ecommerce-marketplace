import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as accountController from "../controllers/account.controller";

const router = Router();

router.use(requireAuth);
router.patch("/profile", accountController.updateProfile);
router.get("/addresses", accountController.getAddresses);
router.post("/addresses", accountController.addAddress);
router.delete("/addresses/:addressId", accountController.deleteAddress);
router.get("/wishlist", accountController.getWishlist);
router.post("/wishlist/:slug", accountController.addWishlistItem);
router.delete("/wishlist/:slug", accountController.removeWishlistItem);

export default router;