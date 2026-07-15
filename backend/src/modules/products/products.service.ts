import { prisma } from "../../lib/prisma.js";

export function listProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
