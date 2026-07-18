import type { NextFunction, Request, Response } from "express";
import { ProductStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import * as service from "./products.service.js";

function productId(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, "Invalid product id");
  return value;
}

export async function getProducts(request: Request, response: Response, next: NextFunction) {
  try {
    const rawStatus = request.query.status;
    if (rawStatus !== undefined && (typeof rawStatus !== "string" || !Object.values(ProductStatus).includes(rawStatus as ProductStatus))) throw new HttpError(400, "Invalid product status");
    response.json(await service.listProducts({
      page: Number(request.query.page ?? 1),
      limit: Number(request.query.limit ?? 10),
      category: typeof request.query.category === "string" ? request.query.category : undefined,
      search: typeof request.query.search === "string" ? request.query.search : undefined,
      status: rawStatus as ProductStatus | undefined,
    }));
  } catch (error) { next(error); }
}

export async function getProduct(request: Request, response: Response, next: NextFunction) {
  try { response.json({ data: await service.getProduct(productId(request.params.productId)) }); }
  catch (error) { next(error); }
}

export async function createProduct(request: Request, response: Response, next: NextFunction) {
  try { response.status(201).json({ data: await service.createProduct(request.body) }); }
  catch (error) { next(error); }
}

export async function updateProduct(request: Request, response: Response, next: NextFunction) {
  try { response.json({ data: await service.updateProduct(productId(request.params.productId), request.body) }); }
  catch (error) { next(error); }
}

export async function deleteProduct(request: Request, response: Response, next: NextFunction) {
  try { await service.deleteProduct(productId(request.params.productId)); response.status(204).send(); }
  catch (error) { next(error); }
}
