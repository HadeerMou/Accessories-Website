import { Router } from "express";
import { getReviews, postReview, removeReview } from "./reviews.controller.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const reviewsRouter = Router();

// Customer route to post a review
reviewsRouter.post("/", requireAuth, postReview);

// Admin routes for managing reviews
reviewsRouter.get("/", requireAuth, requireAdmin, getReviews);
reviewsRouter.delete("/:reviewId", requireAuth, requireAdmin, removeReview);
