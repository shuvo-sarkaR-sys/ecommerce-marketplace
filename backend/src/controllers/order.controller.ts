import type { Request, Response } from "express";
import { asyncHandler, ok } from "../utils/http";
import { checkoutOrderSchema } from "../validators/order.validators";
import * as orderService from "../services/order.service";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });

  const input = checkoutOrderSchema.parse(req.body);
  const order = await orderService.createCheckoutOrder(req.user.sub, input);
  ok(res, { order }, 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });

  ok(res, { orders: await orderService.getOrdersByUser(req.user.sub) });
});
