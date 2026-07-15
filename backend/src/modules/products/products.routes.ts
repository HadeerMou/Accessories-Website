import { Router } from "express";
import { getProducts } from "./products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", getProducts);
