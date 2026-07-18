import { Router } from "express";
import { getOrderById, getOrders, postOrder, putOrder } from "./orders.controller.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.get("/", getOrders);
ordersRouter.post("/", postOrder);
ordersRouter.get("/:orderId", getOrderById);
ordersRouter.put("/:orderId", requireAdmin, putOrder);
