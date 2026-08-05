import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import {
  createReview,
  deleteReview,
  listAllReviews,
} from "./reviews.service.js";
import { type AuthRequest } from "../auth/auth.middleware.js";

function handle(error: unknown, response: Response, next: NextFunction) {
  if (error instanceof HttpError)
    return response.status(error.status).json({ error: error.message });
  next(error);
}

export async function postReview(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const auth = (request as AuthRequest).auth!;
    const { productId, rating, comment } = request.body;

    if (!productId || typeof rating !== "number") {
      throw new HttpError(400, "productId and rating are required");
    }

    const review = await createReview(auth.sub, productId, rating, comment);
    response.status(201).json({ data: review });
  } catch (error) {
    handle(error, response, next);
  }
}

export async function getReviews(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const reviews = await listAllReviews();
    response.json({ data: reviews });
  } catch (error) {
    handle(error, response, next);
  }
}

export async function removeReview(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { reviewId } = request.params;

    if (typeof reviewId !== "string" || !reviewId.trim()) {
      throw new HttpError(400, "Invalid review id");
    }

    await deleteReview(reviewId);
    response.status(204).send();
  } catch (error) {
    handle(error, response, next);
  }
}
