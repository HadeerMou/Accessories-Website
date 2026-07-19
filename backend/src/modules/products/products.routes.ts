import { Router } from "express";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  replaceProduct,
  updateProduct,
} from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.get("/:productId", getProductById);

productsRouter.post("/", requireAuth, requireAdmin, createProduct);
productsRouter.put("/:productId", requireAuth, requireAdmin, replaceProduct);
productsRouter.patch("/:productId", requireAuth, requireAdmin, updateProduct);
productsRouter.delete("/:productId", requireAuth, requireAdmin, deleteProduct);
