import type { ProductStatus } from "../../generated/prisma/enums.js";

export interface ProductFilters { page: number; limit: number; category?: string; search?: string; brand?: string; minPrice?: number; maxPrice?: number; sort?: | "newest" | "oldest" | "price_asc" | "price_desc"; status?: ProductStatus }
export interface ProductImageInput { imageUrl: string; altText?: string | null; isPrimary?: boolean; sortOrder?: number }
export interface ProductVariantInput { color?: string | null; size?: string | null; material?: string | null; stock?: number; price?: number | null; sku?: string | null }
export interface CreateProductInput {
  categoryId?: string | null; nameEn: string; nameAr: string; slugEn?: string | null; slugAr?: string | null;
  descriptionEn?: string | null; descriptionAr?: string | null; price: number; discountPrice?: number | null;
  stock?: number; status?: ProductStatus; featured?: boolean; sku?: string | null; hasVariants?: boolean;
  images?: ProductImageInput[]; variants?: ProductVariantInput[];
}
export type UpdateProductInput = Partial<CreateProductInput>;
