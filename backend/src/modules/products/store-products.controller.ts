import type { NextFunction, Request, Response } from "express";
import * as productsService from "./products.service.js";
import { HttpError } from "../../lib/http-error.js";

function routeSlug(request: Request) {
  const slug = request.params.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    throw new HttpError(400, "Invalid product slug");
  }

  return slug.trim();
}

function optionalQueryString(value: unknown, name: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, `${name} must be a single string value`);
  }
  return value;
}

export async function listStoreProducts(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const result = await productsService.listStoreProducts({
      page: Number(optionalQueryString(request.query.page, "page") ?? 1),
      limit: Number(optionalQueryString(request.query.limit, "limit") ?? 10),
      category: optionalQueryString(request.query.category, "category"),
      search: optionalQueryString(request.query.search, "search"),
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getStoreProduct(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    response.json({
      data: await productsService.getStoreProduct(routeSlug(request)),
    });
  } catch (error) {
    next(error);
  }
}