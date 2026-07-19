import { Router } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../auth/auth.middleware.js";

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

function optionalText(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value !== null && typeof value !== "string") throw new HttpError(400, `${field} must be a string`);
  return typeof value === "string" ? value.trim() || null : null;
}

addressesRouter.get("/", async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).auth!.sub;
    response.json({ data: await prisma.address.findMany({ where: { userId, deletedAt: null }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }) });
  } catch (error) { next(error); }
});

addressesRouter.post("/", async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).auth!.sub;
    const { country, city, street, postalCode, apartment, isDefault } = request.body ?? {};
    if (typeof country !== "string" || typeof city !== "string" || typeof street !== "string" || !country.trim() || !city.trim() || !street.trim()) throw new HttpError(400, "country, city, and street are required");
    if (isDefault !== undefined && typeof isDefault !== "boolean") throw new HttpError(400, "isDefault must be a boolean");
    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) await tx.address.updateMany({ where: { userId, deletedAt: null }, data: { isDefault: false } });
      return tx.address.create({ data: { userId, country: country.trim(), city: city.trim(), street: street.trim(), postalCode: optionalText(postalCode, "postalCode"), apartment: optionalText(apartment, "apartment"), isDefault: isDefault ?? false } });
    });
    response.status(201).json({ data: address });
  } catch (error) { next(error); }
});

addressesRouter.put("/:id", async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).auth!.sub;
    const id = request.params.id;
    if (typeof id !== "string") throw new HttpError(400, "Invalid address id");
    const existing = await prisma.address.findFirst({ where: { id, userId, deletedAt: null } });
    if (!existing) throw new HttpError(404, "Address not found");
    const body = request.body ?? {};
    const country = optionalText(body.country, "country");
    const city = optionalText(body.city, "city");
    const street = optionalText(body.street, "street");
    if (country === null || city === null || street === null) throw new HttpError(400, "country, city, and street cannot be empty");
    if (body.isDefault !== undefined && typeof body.isDefault !== "boolean") throw new HttpError(400, "isDefault must be a boolean");
    const data: Prisma.AddressUpdateInput = {
      ...(country !== undefined ? { country } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(street !== undefined ? { street } : {}),
      ...(body.postalCode !== undefined ? { postalCode: optionalText(body.postalCode, "postalCode") } : {}),
      ...(body.apartment !== undefined ? { apartment: optionalText(body.apartment, "apartment") } : {}),
      ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
      updatedAt: new Date(),
    };
    const address = await prisma.$transaction(async (tx) => {
      if (body.isDefault) await tx.address.updateMany({ where: { userId, deletedAt: null, id: { not: id } }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data });
    });
    response.json({ data: address });
  } catch (error) { next(error); }
});

addressesRouter.delete("/:id", async (request, response, next) => {
  try {
    const userId = (request as AuthRequest).auth!.sub;
    const id = request.params.id;
    if (typeof id !== "string") throw new HttpError(400, "Invalid address id");
    const updated = await prisma.address.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date(), isDefault: false } });
    if (!updated.count) throw new HttpError(404, "Address not found");
    response.status(204).send();
  } catch (error) { next(error); }
});
