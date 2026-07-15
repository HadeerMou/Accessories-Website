import type { Request, Response } from "express";
import { listProducts } from "./products.service.js";

export async function getProducts(_request: Request, response: Response) {
  const products = await listProducts();
  response.json({ data: products });
}
