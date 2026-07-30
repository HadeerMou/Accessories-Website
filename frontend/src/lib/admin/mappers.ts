import type {
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  OrderStatus,
} from "./types";

export function productFromApi(
  value: Record<string, unknown>,
): AdminProduct {
  const category = value.category as {
    id?: string;
    nameEn?: string;
  } | null;
  const stock = Number(value.stock ?? 0);

  return {
    backendId: String(value.id),
    name: String(value.nameEn),
    sku: String(value.sku ?? "NO-SKU"),
    categoryId: category?.id,
    category: category?.nameEn ?? "Uncategorized",
    price: Number(value.price),
    discountPrice:
      value.discountPrice === null || value.discountPrice === undefined
        ? null
        : Number(value.discountPrice),
    stock,
    status: String(value.status) as AdminProduct["status"],
    tone: "from-[#c9aa6a] to-[#efe0b8]",
  };
}

export function orderFromApi(
  value: Record<string, unknown>,
): AdminOrder {
  const user = value.user as { fullName?: string } | null;
  const customer = user?.fullName ?? "Guest";
  const rawStatus = String(value.orderStatus).toLowerCase();
  const status = `${rawStatus.charAt(0).toUpperCase()}${rawStatus.slice(1)}` as OrderStatus;

  return {
    backendId: String(value.id),
    id: `#${String(value.id).slice(0, 8).toUpperCase()}`,
    customer,
    initials: customer
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2),
    color: "bg-[#dce5db]",
    date: new Date(String(value.createdAt)).toLocaleString("en-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    total: Number(value.total),
    items: Array.isArray(value.items) ? value.items.length : 0,
    status,
  };
}

export function customerFromApi(
  value: Record<string, unknown>,
): AdminCustomer {
  const orders = Array.isArray(value.orders)
    ? (value.orders as Array<{
        total?: string | number;
        createdAt?: string | null;
      }>)
    : [];

  return {
    id: String(value.id),
    fullName: String(value.fullName),
    email: String(value.email),
    phone: typeof value.phone === "string" ? value.phone : null,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : null,
    orders: orders.length,
    totalSpent: orders.reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0,
    ),
    lastOrder: orders[0]?.createdAt ?? null,
  };
}
