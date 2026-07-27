import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { OrderStatus } from "../../generated/prisma/enums.js";

export async function createReview(userId: string, productId: string, rating: number, comment?: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, "Rating must be an integer between 1 and 5");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.deletedAt) throw new HttpError(404, "Product not found");

  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId,
      orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      items: { some: { productId } }
    }
  });

  if (!hasPurchased) {
    throw new HttpError(403, "You can only review products you have purchased");
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (existing) {
    throw new HttpError(409, "You have already reviewed this product");
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment: comment?.trim() || null,
    },
    include: { user: { select: { fullName: true } } }
  });
}

export async function listAllReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      product: { select: { nameEn: true, nameAr: true } },
      user: { select: { fullName: true, email: true } }
    }
  });
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new HttpError(404, "Review not found");
  
  return prisma.review.delete({ where: { id } });
}
