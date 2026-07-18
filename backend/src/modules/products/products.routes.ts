import { Router } from "express";
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from "./products.controller.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const productsRouter = Router();

productsRouter.get("/", getProducts);
productsRouter.post("/", requireAuth, requireAdmin, createProduct);

productsRouter.get("/:productId", getProduct);
productsRouter.put("/:productId", requireAuth, requireAdmin, updateProduct);
productsRouter.patch("/:productId", requireAuth, requireAdmin, updateProduct);
productsRouter.delete("/:productId", requireAuth, requireAdmin, deleteProduct);
