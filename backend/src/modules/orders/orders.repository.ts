import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { OrderFilters } from "./orders.types.js";

export const orderInclude = {
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  address: true,
  items: {
    include: {
      product: { select: { id: true, nameEn: true, nameAr: true, sku: true } },
      productVariant: true,
    },
  },
  payments: true,
} satisfies Prisma.OrderInclude;

export class OrdersRepository {
  async list({ page, limit, userId, orderStatus, paymentStatus }: OrderFilters) {
    const where: Prisma.OrderWhereInput = {
      ...(userId ? { userId } : {}),
      ...(orderStatus ? { orderStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: orderInclude });
  }

  create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({ data, include: orderInclude });
  }

  update(id: string, data: Prisma.OrderUpdateInput) {
    return prisma.order.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: orderInclude,
    });
  }
}
