import type { NextFunction, Request, Response } from "express";
import { ProductStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import * as productsService from "./products.service.js";
import type { CreateProductInput, UpdateProductInput } from "./products.types.js";

function routeProductId(request: Request) {
  const id = request.params.productId;
  if (typeof id !== "string" || !id.trim()) throw new HttpError(400, "Invalid product id");
  return id.trim();
}

function requestBody<T>(request: Request): T {
  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return request.body as T;
}

function optionalQueryString(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${name} must be a single string value`);
  return value;
}

/** GET /api/products */
export async function listProducts(request: Request, response: Response, next: NextFunction) {
  try {
    const status = optionalQueryString(request.query.status, "status");
    if (status !== undefined && !Object.values(ProductStatus).includes(status as ProductStatus)) {
      throw new HttpError(400, "Invalid product status");
    }

    const result = await productsService.listAdminProducts({
      page: Number(optionalQueryString(request.query.page, "page") ?? 1),
      limit: Number(optionalQueryString(request.query.limit, "limit") ?? 10),
      category: optionalQueryString(request.query.category, "category"),
      search: optionalQueryString(request.query.search, "search"),
      status: status as ProductStatus | undefined,
    });
    response.json(result);
  } catch (error) {
    next(error);
  }
}

/** GET /api/products/:productId */
export async function getProductById(request: Request, response: Response, next: NextFunction) {
  try {
    response.json({ data: await productsService.getProduct(routeProductId(request)) });
  } catch (error) {
    next(error);
  }
}

/** POST /api/products */
export async function createProduct(request: Request, response: Response, next: NextFunction) {
  try {
    const input = requestBody<CreateProductInput>(request);
    response.status(201).json({ data: await productsService.createProduct(input) });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/products/:productId */
export async function replaceProduct(request: Request, response: Response, next: NextFunction) {
  try {
    const input = requestBody<UpdateProductInput>(request);
    response.json({ data: await productsService.updateProduct(routeProductId(request), input) });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/products/:productId */
export async function updateProduct(request: Request, response: Response, next: NextFunction) {
  try {
    const input = requestBody<UpdateProductInput>(request);
    response.json({ data: await productsService.updateProduct(routeProductId(request), input) });
  } catch (error) {
    next(error);
  }
}

/** PATCH /api/products/:productId/status */
export async function updateProductStatus(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const { status } = requestBody<{ status: ProductStatus }>(request);

        if (!Object.values(ProductStatus).includes(status)) {
            throw new HttpError(400, "Invalid product status");
        }

        const product = await productsService.updateProduct(
            routeProductId(request),
            { status }
        );

        response.json({ data: product });
    } catch (error) {
        next(error);
    }
}

/** DELETE /api/products/:productId */
export async function deleteProduct(request: Request, response: Response, next: NextFunction) {
  try {
    await productsService.deleteProduct(routeProductId(request));
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
