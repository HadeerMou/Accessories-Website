export type Section =
  | "Overview"
  | "Orders"
  | "Products"
  | "Customers"
  | "Discounts"
  | "Reviews";

export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";

export type AdminCategory = {
  id: string;
  nameEn: string;
};

export type AdminNotification = {
  id: string;
  type: "ORDER" | "USER";
  title: string;
  message: string;
  createdAt: string | null;
};

export type AdminOrder = {
  backendId?: string;
  id: string;
  customer: string;
  initials: string;
  color: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  createdAt?: string | null;
  orders?: number;
  totalSpent?: number;
  lastOrder?: string | null;
};

export type AdminDiscount = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: string | number;
  minimumSubtotal?: string | number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
};

export type AdminOverview = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  averageOrderValue: number;
};

export type AdminReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  product: {
    nameEn: string;
    nameAr: string;
  };
  user: {
    fullName: string;
    email: string;
  };
};

export type AdminProduct = {
  backendId?: string;
  name: string;
  sku: string;
  categoryId?: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  status: ProductStatus;
  tone: string;
};
