import { Router } from "express";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const categoriesRouter = Router();

const text = (value: unknown, field: string, required = false) => {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string") throw new HttpError(400, `${field} must be a string`);
  const cleaned = value.trim();
  if (required && !cleaned) throw new HttpError(400, `${field} is required`);
  return cleaned || null;
};

categoriesRouter.get("/", async (_request, response, next) => {
  try { response.json({ data: await prisma.category.findMany({ where: { deletedAt: null }, include: { _count: { select: { products: { where: { deletedAt: null } } } }, children: { where: { deletedAt: null } } }, orderBy: { nameEn: "asc" } }) }); }
  catch (error) { next(error); }
});

categoriesRouter.post("/", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const nameEn = text(request.body?.nameEn, "nameEn", true)!;
    const nameAr = text(request.body?.nameAr, "nameAr", true)!;
    const parentId = request.body?.parentId === null ? null : text(request.body?.parentId, "parentId");
    if (parentId && !(await prisma.category.findFirst({ where: { id: parentId, deletedAt: null } }))) throw new HttpError(400, "Parent category not found");
    const category = await prisma.category.create({ data: { nameEn, nameAr, slugEn: text(request.body?.slugEn, "slugEn") ?? null, slugAr: text(request.body?.slugAr, "slugAr") ?? null, parentId: parentId ?? null } });
    response.status(201).json({ data: category });
  } catch (error) { next(error); }
});

categoriesRouter.put("/:id", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const id = request.params.id;
    if (typeof id !== "string") throw new HttpError(400, "Invalid category id");
    if (!(await prisma.category.findFirst({ where: { id, deletedAt: null } }))) throw new HttpError(404, "Category not found");
    const parentId = request.body?.parentId === null ? null : text(request.body?.parentId, "parentId");
    if (parentId === id) throw new HttpError(400, "A category cannot be its own parent");
    if (parentId && !(await prisma.category.findFirst({ where: { id: parentId, deletedAt: null } }))) throw new HttpError(400, "Parent category not found");
    const data = {
      ...(request.body?.nameEn !== undefined ? { nameEn: text(request.body.nameEn, "nameEn", true)! } : {}),
      ...(request.body?.nameAr !== undefined ? { nameAr: text(request.body.nameAr, "nameAr", true)! } : {}),
      ...(request.body?.slugEn !== undefined ? { slugEn: text(request.body.slugEn, "slugEn") } : {}),
      ...(request.body?.slugAr !== undefined ? { slugAr: text(request.body.slugAr, "slugAr") } : {}),
      ...(request.body?.parentId !== undefined ? { parentId } : {}),
      updatedAt: new Date(),
    };
    response.json({ data: await prisma.category.update({ where: { id }, data }) });
  } catch (error) { next(error); }
});

categoriesRouter.delete("/:id", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const id = request.params.id;
    if (typeof id !== "string") throw new HttpError(400, "Invalid category id");
    const [category, products, children] = await Promise.all([prisma.category.findFirst({ where: { id, deletedAt: null } }), prisma.product.count({ where: { categoryId: id, deletedAt: null } }), prisma.category.count({ where: { parentId: id, deletedAt: null } })]);
    if (!category) throw new HttpError(404, "Category not found");
    if (products || children) throw new HttpError(409, "Cannot delete a category that contains products or subcategories");
    await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), updatedAt: new Date() } });
    response.status(204).send();
  } catch (error) { next(error); }
});
