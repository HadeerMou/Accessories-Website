import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { UserFilters } from "./users.types.js";

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  addresses: { where: { deletedAt: null }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.UserSelect;

export class UsersRepository {
  async list({ page, limit, role, search }: UserFilters) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: publicUserSelect,
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: { id: true } });
  }

  findCredentials(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null }, select: { id: true, fullName: true, email: true, password: true, role: true, isVerified: true } });
  }

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: publicUserSelect });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: publicUserSelect,
    });
  }

  delete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
      select: publicUserSelect,
    });
  }
}
