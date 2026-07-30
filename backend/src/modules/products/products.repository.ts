import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { ProductFilters } from "./products.types.js";
import { ProductStatus } from "../../generated/prisma/enums.js";

export const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.ProductInclude;

export class ProductRepository {
  private buildWhere({
    category,
    search,
    status,
  }: ProductFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by category
    const categorySlug = category?.trim();
    if (categorySlug) {
      where.category = {
        is: {
          OR: [
            { slugEn: categorySlug },
            { slugAr: categorySlug },
          ],
        },
      };
    }

    // Search
    const query = search?.trim();

    if (query) {
      where.OR = [
        {
          nameEn: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          nameAr: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          descriptionEn: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          descriptionAr: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slugEn: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slugAr: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            is: {
              OR: [
                {
                  nameEn: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  nameAr: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
      ];
    }

    return where;
  }

  async list(filters: ProductFilters) {
    const { page, limit } = filters;

    const where = this.buildWhere(filters);

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
    };
  }

  findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { 
        ...productInclude, 
        reviews: { 
          orderBy: { createdAt: "desc" },
          include: { user: { select: { fullName: true } } }
        } 
      },
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

  findStoreBySlug(slug: string) {
    return prisma.product.findFirst({
      where: {
        deletedAt: null,
        status: ProductStatus.ACTIVE,
        OR: [
          { slugEn: slug },
          { slugAr: slug },
        ],
      },
      include: {
        ...productInclude,
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
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

  softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
      include: productInclude,
    });
  }
}
