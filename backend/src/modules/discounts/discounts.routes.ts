import { Router } from "express";
import { DiscountType } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";

export const discountsRouter = Router();
discountsRouter.use(requireAuth, requireAdmin);

const normalizeCode = (value: unknown) => {
  if (typeof value !== "string") throw new HttpError(400, "Discount code is required");
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,100}$/.test(code)) throw new HttpError(400, "Code must be 3-100 letters, numbers, dashes, or underscores");
  return code;
};

function values(body: Record<string, unknown>, partial = false) {
  const type = body.type;
  if (!partial || type !== undefined) {
    if (typeof type !== "string" || !Object.values(DiscountType).includes(type as DiscountType)) throw new HttpError(400, "Invalid discount type");
  }
  const value = body.value;
  if (!partial || value !== undefined) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) throw new HttpError(400, "Discount value must be greater than zero");
    if (type === DiscountType.PERCENTAGE && value > 100) throw new HttpError(400, "Percentage discounts cannot exceed 100");
  }
  const date = (key: "startsAt" | "endsAt") => {
    const input = body[key];
    if (input === undefined) return undefined;
    if (input === null || input === "") return null;
    const result = new Date(String(input));
    if (Number.isNaN(result.getTime())) throw new HttpError(400, `Invalid ${key}`);
    return result;
  };
  const usageLimit = body.usageLimit;
  if (usageLimit !== undefined && usageLimit !== null && (typeof usageLimit !== "number" || !Number.isInteger(usageLimit) || usageLimit < 1)) throw new HttpError(400, "Usage limit must be a positive whole number");
  const minimumSubtotal = body.minimumSubtotal;
  if (minimumSubtotal !== undefined && minimumSubtotal !== null && (typeof minimumSubtotal !== "number" || !Number.isFinite(minimumSubtotal) || minimumSubtotal < 0)) throw new HttpError(400, "Minimum subtotal must be non-negative");
  return {
    ...(body.code !== undefined ? { code: normalizeCode(body.code) } : {}),
    ...(type !== undefined ? { type: type as DiscountType } : {}),
    ...(value !== undefined ? { value } : {}),
    ...(minimumSubtotal !== undefined ? { minimumSubtotal: minimumSubtotal === null ? null : minimumSubtotal as number } : {}),
    ...(usageLimit !== undefined ? { usageLimit: usageLimit === null ? null : usageLimit as number } : {}),
    ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
    ...(body.startsAt !== undefined ? { startsAt: date("startsAt") } : {}),
    ...(body.endsAt !== undefined ? { endsAt: date("endsAt") } : {}),
  };
}

discountsRouter.get("/", async (_request, response, next) => {
  try { response.json({ data: await prisma.discount.findMany({ orderBy: { createdAt: "desc" } }) }); } catch (error) { next(error); }
});
discountsRouter.post("/", async (request, response, next) => {
  try {
    const data = values(request.body as Record<string, unknown>);
    if (!data.code || !data.type || data.value === undefined) throw new HttpError(400, "code, type, and value are required");
    if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) throw new HttpError(400, "End date must be after start date");
    response.status(201).json({ data: await prisma.discount.create({ data: { ...data, code: data.code!, type: data.type!, value: data.value! } }) });
  } catch (error) { next(error); }
});
discountsRouter.patch("/:discountId", async (request, response, next) => {
  try {
    const id = request.params.discountId;
    if (!id) throw new HttpError(400, "Invalid discount id");
    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Discount not found");
    const data = values(request.body as Record<string, unknown>, true);
    const startsAt = data.startsAt === undefined ? existing.startsAt : data.startsAt;
    const endsAt = data.endsAt === undefined ? existing.endsAt : data.endsAt;
    if (startsAt && endsAt && startsAt >= endsAt) throw new HttpError(400, "End date must be after start date");
    response.json({ data: await prisma.discount.update({ where: { id }, data: { ...data, updatedAt: new Date() } }) });
  } catch (error) { next(error); }
});
