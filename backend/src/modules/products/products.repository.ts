import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { ProductFilters } from "./products.types.js";

export const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ProductInclude;

export class ProductRepository {
  async list({ page, limit, category, search, status }: ProductFilters) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(category
        ? { category: { is: { OR: [{ slugEn: category }, { slugAr: category }] } } }
        : {}),
      ...(search
        ? {
            OR: [
              { nameEn: { contains: search, mode: "insensitive" } },
              { nameAr: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { ...productInclude, reviews: true },
    });
  }

  categoryExists(id: string) {
    return prisma.category.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  }

  findConflictingUniqueValues(input: { sku?: string | null; slugEn?: string | null; slugAr?: string | null }, excludeId?: string) {
    const candidates: Prisma.ProductWhereInput[] = [];
    if (input.sku) candidates.push({ sku: input.sku });
    if (input.slugEn) candidates.push({ slugEn: input.slugEn });
    if (input.slugAr) candidates.push({ slugAr: input.slugAr });
    if (!candidates.length) return Promise.resolve(null);
    return prisma.product.findFirst({
      where: { ...(excludeId ? { id: { not: excludeId } } : {}), OR: candidates },
      select: { sku: true, slugEn: true, slugAr: true },
    });
  }

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data, include: productInclude });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: productInclude,
    });
  }

  archive(id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED", deletedAt: new Date(), updatedAt: new Date() },
      include: productInclude,
    });
  }
}
