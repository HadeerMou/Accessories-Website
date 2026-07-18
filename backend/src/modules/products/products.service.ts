import type { Prisma } from "../../generated/prisma/client.js";
import { ProductStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { ProductRepository } from "./products.repository.js";
import type { CreateProductInput, ProductFilters, UpdateProductInput } from "./products.types.js";

const repository = new ProductRepository();
const clean = (value: string | null | undefined) => value?.trim() || null;

function validateNestedInput(input: CreateProductInput | UpdateProductInput) {
  for (const [index, image] of (input.images ?? []).entries()) {
    if (!image.imageUrl?.trim()) throw new HttpError(400, `images[${index}].imageUrl is required`);
    if (image.sortOrder !== undefined && !Number.isInteger(image.sortOrder)) throw new HttpError(400, `images[${index}].sortOrder must be an integer`);
  }
  if ((input.images ?? []).filter((image) => image.isPrimary).length > 1) throw new HttpError(400, "Only one image can be primary");
  for (const [index, variant] of (input.variants ?? []).entries()) {
    if (variant.stock !== undefined && (!Number.isInteger(variant.stock) || variant.stock < 0)) throw new HttpError(400, `variants[${index}].stock must be a non-negative integer`);
    if (variant.price !== undefined && variant.price !== null && (!Number.isFinite(variant.price) || variant.price < 0)) throw new HttpError(400, `variants[${index}].price must be non-negative`);
  }
  const variantSkus = (input.variants ?? []).map((variant) => clean(variant.sku)).filter(Boolean);
  if (new Set(variantSkus).size !== variantSkus.length) throw new HttpError(400, "Variant SKUs must be unique");
}

function validate(input: CreateProductInput | UpdateProductInput, currentPrice?: number) {
  if (input.nameEn !== undefined && !input.nameEn.trim()) throw new HttpError(400, "nameEn cannot be empty");
  if (input.nameAr !== undefined && !input.nameAr.trim()) throw new HttpError(400, "nameAr cannot be empty");
  if (input.price !== undefined && (!Number.isFinite(input.price) || input.price < 0)) throw new HttpError(400, "price must be a non-negative number");
  const effectivePrice = input.price ?? currentPrice;
  if (input.discountPrice !== undefined && input.discountPrice !== null && (!Number.isFinite(input.discountPrice) || input.discountPrice < 0 || (effectivePrice !== undefined && input.discountPrice >= effectivePrice))) throw new HttpError(400, "discountPrice must be non-negative and lower than price");
  if (input.stock !== undefined && (!Number.isInteger(input.stock) || input.stock < 0)) throw new HttpError(400, "stock must be a non-negative integer");
  if (input.status !== undefined && !Object.values(ProductStatus).includes(input.status)) throw new HttpError(400, "Invalid product status");
  validateNestedInput(input);
}

async function validateRelationsAndUniqueness(input: CreateProductInput | UpdateProductInput, excludeId?: string) {
  if (input.categoryId && !(await repository.categoryExists(input.categoryId))) throw new HttpError(400, "Category not found");
  const values = { sku: clean(input.sku), slugEn: clean(input.slugEn), slugAr: clean(input.slugAr) };
  const conflict = await repository.findConflictingUniqueValues(values, excludeId);
  if (conflict) {
    if (values.sku && conflict.sku === values.sku) throw new HttpError(409, "SKU is already in use");
    if (values.slugEn && conflict.slugEn === values.slugEn) throw new HttpError(409, "English slug is already in use");
    throw new HttpError(409, "Arabic slug is already in use");
  }
}

export async function listProducts(filters: ProductFilters) {
  const page = Number.isFinite(filters.page) && filters.page > 0 ? Math.floor(filters.page) : 1;
  const limit = Number.isFinite(filters.limit) && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 50) : 10;
  const result = await repository.list({ ...filters, page, limit, category: clean(filters.category) ?? undefined, search: clean(filters.search) ?? undefined });
  return { ...result, page, limit, pages: Math.ceil(result.total / limit) };
}

export async function getProduct(id: string) {
  const product = await repository.findById(id);
  if (!product) throw new HttpError(404, "Product not found");
  return product;
}

export async function createProduct(input: CreateProductInput) {
  if (!input || !input.nameEn || !input.nameAr || input.price === undefined) throw new HttpError(400, "nameEn, nameAr, and price are required");
  validate(input);
  await validateRelationsAndUniqueness(input);
  return repository.create({
    nameEn: input.nameEn.trim(), nameAr: input.nameAr.trim(), price: input.price,
    status: input.status ?? ProductStatus.DRAFT, stock: input.stock ?? 0,
    category: input.categoryId ? { connect: { id: input.categoryId } } : undefined,
    slugEn: clean(input.slugEn), slugAr: clean(input.slugAr),
    descriptionEn: clean(input.descriptionEn), descriptionAr: clean(input.descriptionAr),
    discountPrice: input.discountPrice ?? null, featured: input.featured ?? false,
    sku: clean(input.sku), hasVariants: input.hasVariants ?? Boolean(input.variants?.length),
    images: input.images?.length ? { create: input.images.map((image) => ({ ...image, imageUrl: image.imageUrl.trim() })) } : undefined,
    variants: input.variants?.length ? { create: input.variants } : undefined,
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  if (!input || !Object.keys(input).length) throw new HttpError(400, "No product fields were provided");
  const current = await getProduct(id);
  validate(input, Number(current.price));
  await validateRelationsAndUniqueness(input, id);
  const data: Prisma.ProductUpdateInput = {
    ...(input.nameEn !== undefined ? { nameEn: input.nameEn.trim() } : {}),
    ...(input.nameAr !== undefined ? { nameAr: input.nameAr.trim() } : {}),
    ...(input.slugEn !== undefined ? { slugEn: clean(input.slugEn) } : {}),
    ...(input.slugAr !== undefined ? { slugAr: clean(input.slugAr) } : {}),
    ...(input.descriptionEn !== undefined ? { descriptionEn: clean(input.descriptionEn) } : {}),
    ...(input.descriptionAr !== undefined ? { descriptionAr: clean(input.descriptionAr) } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.discountPrice !== undefined ? { discountPrice: input.discountPrice } : {}),
    ...(input.stock !== undefined ? { stock: input.stock } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.featured !== undefined ? { featured: input.featured } : {}),
    ...(input.sku !== undefined ? { sku: clean(input.sku) } : {}),
    ...(input.hasVariants !== undefined ? { hasVariants: input.hasVariants } : {}),
    ...(input.categoryId !== undefined ? { category: input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true } } : {}),
    ...(input.images !== undefined ? { images: { deleteMany: {}, create: input.images.map((image) => ({ ...image, imageUrl: image.imageUrl.trim() })) } } : {}),
    ...(input.variants !== undefined ? { variants: { deleteMany: {}, create: input.variants } } : {}),
  };
  return repository.update(id, data);
}

export async function deleteProduct(id: string) {
  await getProduct(id);
  return repository.archive(id);
}
