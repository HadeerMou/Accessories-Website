import { DiscountType, InventoryReason, OrderStatus, PaymentProvider, PaymentStatus, ProductStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { sendOrderConfirmation } from "../../lib/mailer.js";
import { prisma } from "../../lib/prisma.js";
import { orderInclude, OrdersRepository } from "./orders.repository.js";
import type { CheckoutInput, CreateOrderInput, OrderFilters, UpdateOrderInput } from "./orders.types.js";

const repository = new OrdersRepository();

export async function listOrders(filters: OrderFilters) {
  const page = Number.isFinite(filters.page) && filters.page > 0 ? Math.floor(filters.page) : 1;
  const limit = Number.isFinite(filters.limit) && filters.limit > 0 ? Math.min(Math.floor(filters.limit), 50) : 10;
  const result = await repository.list({ ...filters, page, limit });
  return { ...result, page, limit, pages: Math.ceil(result.total / limit) };
}

export async function getOrder(id: string) {
  const order = await repository.findById(id);
  if (!order) throw new HttpError(404, "Order not found");
  return order;
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.userId || !input.addressId || !Array.isArray(input.items) || input.items.length === 0) {
    throw new HttpError(400, "userId, addressId, and at least one item are required");
  }
  if (input.items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new HttpError(400, "Each item needs a productId and a positive integer quantity");
  }
  const itemKeys = input.items.map((item) => `${item.productId}:${item.productVariantId ?? ""}`);
  if (new Set(itemKeys).size !== itemKeys.length) throw new HttpError(400, "Duplicate order items must be combined into one item");
  const shipping = input.shipping ?? 0;
  const discount = input.discount ?? 0;
  if (!Number.isFinite(shipping) || shipping < 0 || !Number.isFinite(discount) || discount < 0) {
    throw new HttpError(400, "shipping and discount must be non-negative numbers");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({ where: { id: input.userId, deletedAt: null }, select: { id: true } });
    if (!user) throw new HttpError(404, "User not found");
    const address = await tx.address.findFirst({
      where: { id: input.addressId, userId: input.userId, deletedAt: null },
      select: { id: true },
    });
    if (!address) throw new HttpError(400, "Address does not belong to this user");

    const orderItems: Array<{ productId: string; productVariantId: string | null; quantity: number; price: number }> = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, deletedAt: null, status: ProductStatus.ACTIVE },
        include: { variants: item.productVariantId ? { where: { id: item.productVariantId } } : false },
      });
      if (!product) throw new HttpError(404, `Product ${item.productId} not found or unavailable`);

      const variant = item.productVariantId ? product.variants[0] : undefined;
      if (item.productVariantId && !variant) throw new HttpError(400, "Variant does not belong to the selected product");
      const availableStock = variant?.stock ?? product.stock ?? 0;
      if (availableStock < item.quantity) throw new HttpError(409, `Insufficient stock for ${product.nameEn}`);

      const unitPrice = Number(variant?.price ?? product.discountPrice ?? product.price);
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        productId: product.id,
        productVariantId: variant?.id ?? null,
        quantity: item.quantity,
        price: unitPrice,
      });

      if (variant) {
        const updated = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new HttpError(409, `Insufficient stock for ${product.nameEn}`);
      } else {
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new HttpError(409, `Insufficient stock for ${product.nameEn}`);
      }
    }

    subtotal = Number(subtotal.toFixed(2));
    const total = Number((subtotal + shipping - discount).toFixed(2));
    if (total < 0) throw new HttpError(400, "discount cannot exceed the order amount");

    return tx.order.create({
      data: {
        user: { connect: { id: input.userId } },
        address: { connect: { id: input.addressId } },
        orderStatus: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal,
        shipping,
        discount,
        total,
        items: { create: orderItems },
      },
      include: orderInclude,
    });
  });
}

export async function updateOrder(id: string, input: UpdateOrderInput) {
  const current = await getOrder(id);
  if (current.orderStatus === OrderStatus.CANCELLED || current.orderStatus === OrderStatus.REFUNDED) {
    throw new HttpError(409, "A cancelled or refunded order cannot be updated");
  }
  if (!input.orderStatus && !input.paymentStatus) throw new HttpError(400, "No order fields were provided");
  if (input.orderStatus === OrderStatus.CANCELLED) {
    return prisma.$transaction(async (tx) => {
      for (const item of current.items) {
        if (item.productVariantId) await tx.productVariant.update({ where: { id: item.productVariantId }, data: { stock: { increment: item.quantity } } });
        else if (item.productId) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        if (item.productId) await tx.inventoryLog.create({ data: { productId: item.productId, productVariantId: item.productVariantId, quantityChange: item.quantity, reason: "RETURN" } });
      }
      return tx.order.update({ where: { id }, data: { ...input, updatedAt: new Date() }, include: orderInclude });
    });
  }
  return repository.update(id, input);
}

export async function checkoutCart(userId: string, input: CheckoutInput) {
  for (const field of ["phone", "country", "city", "street"] as const) {
    if (typeof input[field] !== "string" || !input[field].trim()) throw new HttpError(400, `${field} is required`);
  }

  const order = await prisma.$transaction(async tx => {
    const user = await tx.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true, fullName: true, email: true } });
    if (!user) throw new HttpError(404, "User not found");
    const cart = await tx.cart.findFirst({ where: { userId }, include: { items: true } });
    if (!cart?.items.length) throw new HttpError(400, "Your cart is empty");

    const address = await tx.address.create({ data: { userId, country: input.country.trim(), city: input.city.trim(), street: input.street.trim(), apartment: input.apartment?.trim() || null, postalCode: input.postalCode?.trim() || null, isDefault: true } });
    await tx.address.updateMany({ where: { userId, id: { not: address.id }, deletedAt: null }, data: { isDefault: false } });
    await tx.user.update({ where: { id: userId }, data: { phone: input.phone.trim(), ...(input.fullName?.trim() ? { fullName: input.fullName.trim() } : {}), updatedAt: new Date() } });

    let subtotal = 0;
    const items: Array<{ productId: string; productVariantId: string | null; quantity: number; price: number }> = [];
    for (const cartItem of cart.items) {
      if (!cartItem.productId) throw new HttpError(409, "A cart item no longer has a product");
      const product = await tx.product.findFirst({ where: { id: cartItem.productId, deletedAt: null, status: ProductStatus.ACTIVE }, include: { variants: cartItem.productVariantId ? { where: { id: cartItem.productVariantId } } : false } });
      if (!product) throw new HttpError(409, "A product in your cart is no longer available");
      const variant = cartItem.productVariantId ? product.variants[0] : undefined;
      if (cartItem.productVariantId && !variant) throw new HttpError(409, "A selected product option is no longer available");
      const price = Number(variant?.price ?? product.discountPrice ?? product.price);
      const updated = variant
        ? await tx.productVariant.updateMany({ where: { id: variant.id, stock: { gte: cartItem.quantity } }, data: { stock: { decrement: cartItem.quantity } } })
        : await tx.product.updateMany({ where: { id: product.id, stock: { gte: cartItem.quantity } }, data: { stock: { decrement: cartItem.quantity } } });
      if (updated.count !== 1) throw new HttpError(409, `Insufficient stock for ${product.nameEn}`);
      subtotal += price * cartItem.quantity;
      items.push({ productId: product.id, productVariantId: variant?.id ?? null, quantity: cartItem.quantity, price });
      await tx.inventoryLog.create({ data: { productId: product.id, productVariantId: variant?.id ?? null, userId, quantityChange: -cartItem.quantity, reason: InventoryReason.ORDER } });
    }

    subtotal = Number(subtotal.toFixed(2));
    let discountAmount = 0;
    let appliedDiscount: { id: string; code: string } | null = null;
    const couponCode = input.couponCode?.trim().toUpperCase();
    if (couponCode) {
      const discount = await tx.discount.findUnique({ where: { code: couponCode } });
      const now = new Date();
      if (!discount || !discount.isActive || (discount.startsAt && discount.startsAt > now) || (discount.endsAt && discount.endsAt < now) || (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit)) throw new HttpError(400, "This discount code is not available");
      if (discount.minimumSubtotal !== null && subtotal < Number(discount.minimumSubtotal)) throw new HttpError(400, `This code requires a minimum order of EGP ${Number(discount.minimumSubtotal).toFixed(0)}`);
      discountAmount = discount.type === DiscountType.PERCENTAGE ? subtotal * (Number(discount.value) / 100) : Number(discount.value);
      discountAmount = Number(Math.min(subtotal, discountAmount).toFixed(2));
      await tx.discount.update({ where: { id: discount.id }, data: { usedCount: { increment: 1 }, updatedAt: now } });
      appliedDiscount = { id: discount.id, code: discount.code };
    }
    const total = Number((subtotal - discountAmount).toFixed(2));
    const created = await tx.order.create({ data: { userId, addressId: address.id, orderStatus: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PENDING, subtotal, shipping: 0, discount: discountAmount, total, ...(appliedDiscount ? { discountId: appliedDiscount.id, discountCode: appliedDiscount.code } : {}), items: { create: items }, payments: { create: { provider: PaymentProvider.CASH_ON_DELIVERY, amount: total, currency: "EGP", status: PaymentStatus.PENDING } } }, include: orderInclude });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  const confirmationEmailSent = await sendOrderConfirmation(order).catch(error => { console.error("Could not send order confirmation", error); return false; });
  return { ...order, confirmationEmailSent };
}
