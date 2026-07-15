import { Router } from "express";
import { productsRouter } from "../modules/products/products.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.use("/products", productsRouter);
