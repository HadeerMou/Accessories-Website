import type { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

export interface OrderFilters {
  page: number;
  limit: number;
  userId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface CreateOrderItemInput {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  items: CreateOrderItemInput[];
  shipping?: number;
  discount?: number;
}

export interface UpdateOrderInput {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface CheckoutInput {
  fullName?: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  apartment?: string | null;
  postalCode?: string | null;
}
