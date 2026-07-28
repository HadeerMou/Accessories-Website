"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

type Section = "Overview" | "Orders" | "Products" | "Customers" | "Discounts" | "Reviews";
type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";
type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";
type AdminCategory = { id: string; nameEn: string };
type AdminNotification = { id:string; type:"ORDER"|"USER"; title:string; message:string; createdAt:string|null };
type AdminCustomer = { id: string; fullName: string; email: string; phone?: string | null; createdAt?: string | null; orders?: number; totalSpent?: number; lastOrder?: string | null };
type AdminDiscount = { id: string; code: string; type: "PERCENTAGE" | "FIXED_AMOUNT"; value: string | number; minimumSubtotal?: string | number | null; startsAt?: string | null; endsAt?: string | null; usageLimit?: number | null; usedCount: number; isActive: boolean };
type AdminOverview = { revenue: number; orders: number; customers: number; products: number; averageOrderValue: number };
type AdminReview = { id: string; rating: number; comment?: string | null; createdAt: string; product: { nameEn: string; nameAr: string }; user: { fullName: string; email: string } };
type AdminProduct = {
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

const productFromApi = (value: Record<string, unknown>): AdminProduct => {
  const category = value.category as { id?: string; nameEn?: string } | null;
  const stock = Number(value.stock ?? 0);
  return {
    backendId: String(value.id),
    name: String(value.nameEn),
    sku: String(value.sku ?? "NO-SKU"),
    categoryId: category?.id,
    category: category?.nameEn ?? "Uncategorized",
    price: Number(value.price),
    discountPrice: value.discountPrice === null || value.discountPrice === undefined ? null : Number(value.discountPrice),
    stock,
    status: String(value.status) as ProductStatus,
    tone: "from-[#c9aa6a] to-[#efe0b8]",
  };
};

const ordersSeed = [
  {
    id: "#AU-1048",
    customer: "Mariam Hassan",
    initials: "MH",
    color: "bg-[#e9d8c8]",
    date: "18 Jul, 10:24 AM",
    total: 2840,
    items: 3,
    status: "Processing" as OrderStatus,
  },
  {
    id: "#AU-1047",
    customer: "Nour El Din",
    initials: "NE",
    color: "bg-[#dce5db]",
    date: "18 Jul, 9:42 AM",
    total: 1650,
    items: 2,
    status: "Shipped" as OrderStatus,
  },
  {
    id: "#AU-1046",
    customer: "Salma Adel",
    initials: "SA",
    color: "bg-[#e5dfe8]",
    date: "17 Jul, 8:15 PM",
    total: 3290,
    items: 4,
    status: "Delivered" as OrderStatus,
  },
  {
    id: "#AU-1045",
    customer: "Omar Khaled",
    initials: "OK",
    color: "bg-[#d9e5e7]",
    date: "17 Jul, 5:36 PM",
    total: 980,
    items: 1,
    status: "Processing" as OrderStatus,
  },
  {
    id: "#AU-1044",
    customer: "Farida Ali",
    initials: "FA",
    color: "bg-[#eee0d5]",
    date: "17 Jul, 1:18 PM",
    total: 2140,
    items: 2,
    status: "Cancelled" as OrderStatus,
  },
];

const productsSeed: AdminProduct[] = [
  {
    name: "Sculpted Gold Hoops",
    sku: "EAR-GLD-018",
    category: "Earrings",
    price: 1450,
    stock: 24,
    status: "ACTIVE",
    tone: "from-[#d1ae68] to-[#f1dfb5]",
  },
  {
    name: "Serpentine Necklace",
    sku: "NEC-GLD-024",
    category: "Necklaces",
    price: 2200,
    stock: 8,
    status: "ACTIVE",
    tone: "from-[#b69a65] to-[#e7d6aa]",
  },
  {
    name: "Pearl Signet Ring",
    sku: "RNG-PRL-012",
    category: "Rings",
    price: 1780,
    stock: 0,
    status: "DRAFT",
    tone: "from-[#d8d1c3] to-[#fbf8ef]",
  },
  {
    name: "Twist Cuff Bracelet",
    sku: "BRC-GLD-031",
    category: "Bracelets",
    price: 1950,
    stock: 16,
    status: "ACTIVE",
    tone: "from-[#c8a862] to-[#ebd296]",
  },
];

const nav: { label: Section; icon: typeof LayoutDashboard; badge?: string }[] =
  [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Orders", icon: ShoppingBag },
    { label: "Products", icon: Package },
    { label: "Customers", icon: Users },
    { label: "Discounts", icon: Tag },
    { label: "Reviews", icon: Star },
  ];

const money = (value: number) =>
  new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const response = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to sign in");
      if (body.data.user.role !== "ADMIN")
        throw new Error("This account does not have administrator access");
      onLogin(body.data.accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen bg-[#1f2b25] p-5 lg:grid-cols-2">
      <div className="hidden flex-col justify-between rounded-3xl bg-[radial-gradient(circle_at_20%_10%,#657b69,transparent_40%),linear-gradient(145deg,#31483c,#18221d)] p-12 text-white lg:flex">
        <div className="font-serif text-3xl tracking-[.2em]">AURA</div>
        <div>
          <div className="mb-5 h-px w-12 bg-[#d3b47b]" />
          <h1 className="max-w-lg font-serif text-5xl leading-tight">
            Your store,
            <br />
            beautifully managed.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
            Orders, inventory, customers, and revenue in one calm workspace.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-[.2em] text-white/30">
          Aura administration · Cairo
        </div>
      </div>
      <div className="grid place-items-center">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-3xl bg-[#faf9f6] p-8 shadow-2xl sm:p-10"
        >
          <div className="font-serif text-2xl tracking-[.18em] lg:hidden">
            AURA
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#98784c]">
              Secure workspace
            </div>
            <h2 className="mt-3 font-serif text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-black/40">
              Sign in with your administrator account.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <label className="block text-xs font-semibold">
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-4 font-normal outline-none focus:border-[#667d6b]"
                placeholder="admin@aura.com"
              />
            </label>
            <label className="block text-xs font-semibold">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-lg border border-black/10 bg-white px-4 font-normal outline-none focus:border-[#667d6b]"
                placeholder="••••••••"
              />
            </label>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="mt-6 h-12 w-full rounded-lg bg-[#24352c] text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in to dashboard"}
          </button>
          <p className="mt-6 text-center text-[10px] leading-4 text-black/35">
            Administrator access only. Activity may be logged for security.
          </p>
        </form>
      </div>
    </div>
  );
}

function Status({ value }: { value: string }) {
  const style =
    value === "Delivered" || value === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : value === "Shipped"
        ? "bg-blue-50 text-blue-700"
        : value === "Processing" || value === "DRAFT"
          ? "bg-amber-50 text-amber-700"
          : "bg-rose-50 text-rose-700";

  const label =
    value === "ACTIVE"
      ? "Active"
      : value === "Delivered"
      ? "Delivered"
      : value === "Shipped"
      ? "Shipped"
      : value === "DRAFT"
      ? "Draft"
      : value === "Processing"
      ? "Processing"
      : "Out of stock";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [orders, setOrders] = useState(ordersSeed.slice(0, 0));
  const [products, setProducts] = useState(productsSeed.slice(0, 0));
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showProduct, setShowProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [toast, setToast] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(window.localStorage.getItem("aura_admin_token"));
      setCheckingAuth(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!token) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${base}/products?limit=50`, { headers }),
      fetch(`${base}/orders?limit=50`, { headers }),
      fetch(`${base}/categories`, { headers }),
      fetch(`${base}/users?role=CUSTOMER&limit=50`, { headers }),
      fetch(`${base}/discounts`, { headers }),
      fetch(`${base}/reviews`, { headers }),
      fetch(`${base}/admin/overview`, { headers }),
    ])
      .then(async ([productsResponse, ordersResponse, categoriesResponse, customersResponse, discountsResponse, reviewsResponse, overviewResponse]) => {
        if (
          productsResponse.status === 401 ||
          productsResponse.status === 403 ||
          ordersResponse.status === 401 ||
          ordersResponse.status === 403
        ) {
          window.localStorage.removeItem("aura_admin_token");
          setToken(null);
          return;
        }
        if (productsResponse.ok) {
          const body = await productsResponse.json();
          setProducts(body.data.map(productFromApi));
        }
        if (ordersResponse.ok) {
          const body = await ordersResponse.json();
          setOrders(
            body.data.map((o: Record<string, unknown>) => {
              const user = o.user as { fullName?: string } | null;
              const name = user?.fullName ?? "Guest";
              const status = String(o.orderStatus).toLowerCase();
              return {
                backendId: String(o.id),
                id: `#${String(o.id).slice(0, 8).toUpperCase()}`,
                customer: name,
                initials: name
                  .split(" ")
                  .map((v) => v[0])
                  .join("")
                  .slice(0, 2),
                color: "bg-[#dce5db]",
                date: new Date(String(o.createdAt)).toLocaleString("en-EG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                total: Number(o.total),
                items: (o.items as unknown[]).length,
                status: (status.charAt(0).toUpperCase() +
                  status.slice(1)) as OrderStatus,
              };
            }),
          );
        }
        if (categoriesResponse.ok) {
          const body = await categoriesResponse.json();
          setCategories(
            body.data.map((category: AdminCategory) => ({
              id: category.id,
              nameEn: category.nameEn,
            })),
          );
        }
        if (customersResponse.ok) {
          const body = await customersResponse.json();
          setCustomers(body.data.map((customer: Record<string, unknown>) => {
            const customerOrders = Array.isArray(customer.orders) ? customer.orders as Array<{ total?: string | number; createdAt?: string | null }> : [];
            return { id: String(customer.id), fullName: String(customer.fullName), email: String(customer.email), phone: typeof customer.phone === "string" ? customer.phone : null, createdAt: typeof customer.createdAt === "string" ? customer.createdAt : null, orders: customerOrders.length, totalSpent: customerOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0), lastOrder: customerOrders[0]?.createdAt ?? null };
          }));
        }
        if (discountsResponse.ok) setDiscounts((await discountsResponse.json()).data);
        if (reviewsResponse.ok) setReviews((await reviewsResponse.json()).data);
        if (overviewResponse.ok) setOverview((await overviewResponse.json()).data);
      })
      .catch(() => {
        setToast("Backend is unavailable — showing cached dashboard data");
        window.setTimeout(() => setToast(""), 2400);
      });
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const headers = { Authorization: `Bearer ${token}` };
    const refresh = async () => {
      const [notificationResponse, orderResponse] = await Promise.all([
        fetch(`${base}/admin/notifications`, { headers }),
        fetch(`${base}/orders?limit=50`, { headers }),
      ]);
      if (notificationResponse.ok) setNotifications((await notificationResponse.json()).data);
      if (orderResponse.ok) {
        const body = await orderResponse.json();
        setOrders(body.data.map((o: Record<string, unknown>) => {
          const user = o.user as { fullName?: string } | null;
          const name = user?.fullName ?? "Guest";
          const status = String(o.orderStatus).toLowerCase();
          return { backendId:String(o.id),id:`#${String(o.id).slice(0,8).toUpperCase()}`,customer:name,initials:name.split(" ").map(value=>value[0]).join("").slice(0,2),color:"bg-[#dce5db]",date:new Date(String(o.createdAt)).toLocaleString("en-EG",{dateStyle:"medium",timeStyle:"short"}),total:Number(o.total),items:(o.items as unknown[]).length,status:(status.charAt(0).toUpperCase()+status.slice(1)) as OrderStatus };
        }));
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [token]);

  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "All" || o.status === filter) &&
          `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [orders, query, filter],
  );
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const updateOrder = (id: string, status: OrderStatus) => {
    const selected = orders.find((o) => o.id === id) as
      ((typeof orders)[number] & { backendId?: string }) | undefined;
    setOrders((v) => v.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.backendId && token) {
      const base =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      fetch(`${base}/orders/${selected.backendId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: status.toUpperCase().replace(" ", "_"),
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error();
          notify(`${id} updated to ${status}`);
        })
        .catch(() => notify("Could not save the order update"));
    } else notify(`${id} updated to ${status}`);
  };
  const saveProduct = async (product: AdminProduct) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const current = editingProduct;
    const response = await fetch(
      `${base}/products${current?.backendId ? `/${current.backendId}` : ""}`,
      {
        method: current?.backendId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nameEn: product.name,
          nameAr: product.name,
          categoryId: product.categoryId || null,
          price: product.price,
          discountPrice: product.discountPrice ?? null,
          stock: product.stock,
          sku: product.sku,
          status: product.status,
        }),
      },
    );
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error ?? "Could not save the product");
    const saved = productFromApi(body.data);
    setProducts((items) =>
      current?.backendId
        ? items.map((item) =>
            item.backendId === current.backendId ? saved : item,
          )
        : [saved, ...items],
    );
    setShowProduct(false);
    setEditingProduct(null);
    notify(current ? "Product updated" : "Product added to catalog");
  };
  const createCategory = async (name: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const response = await fetch(`${base}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nameEn: name, nameAr: name }),
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error ?? "Could not create the category");
    const category = {
      id: String(body.data.id),
      nameEn: String(body.data.nameEn),
    };
    setCategories((items) =>
      [...items, category].sort((a, b) => a.nameEn.localeCompare(b.nameEn)),
    );
    return category;
  };

  if (checkingAuth)
    return (
      <div className="grid min-h-screen place-items-center bg-[#1f2b25] text-sm text-white/60">
        Loading Aura administration…
      </div>
    );
  if (!token)
    return (
      <AdminLogin
        onLogin={(value) => {
          window.localStorage.setItem("aura_admin_token", value);
          setToken(value);
        }}
      />
    );
  return (
    <div className="min-h-screen bg-[#f6f5f1] font-sans text-[#252622]">
      {mobileNav && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-black/8 bg-[#1f2b25] text-white transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-7">
          <div>
            <div className="font-serif text-2xl tracking-[.18em]">AURA</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[.28em] text-white/45">
              Administration
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNav(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-7">
          <div className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[.18em] text-white/35">
            Workspace
          </div>
          {nav.map(({ label, icon: Icon }) => {
            const pendingOrdersCount = orders.filter(o => o.status === "Processing").length;
            const badge = label === "Orders" && pendingOrdersCount > 0 ? String(pendingOrdersCount) : undefined;
            return (
            <button
              key={label}
              onClick={() => {
                setSection(label);
                setMobileNav(false);
                setQuery("");
                setFilter("All");
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${section === label ? "bg-white text-[#203028] shadow-sm" : "text-white/65 hover:bg-white/8 hover:text-white"}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${section === label ? "bg-[#203028] text-white" : "bg-[#cba66b] text-[#203028]"}`}
                >
                  {badge}
                </span>
              )}
            </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => {
              window.localStorage.removeItem("aura_admin_token");
              setToken(null);
            }}
            className="mt-3 flex w-full items-center gap-3 rounded-xl bg-white/7 p-3 text-left"
          >
            <div className="grid size-9 place-items-center rounded-full bg-[#d3b47b] text-xs font-bold text-[#1f2b25]">
              HS
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">Hadeer Shibt</div>
              <div className="truncate text-[10px] text-white/40">
                Store owner · Sign out
              </div>
            </div>
            <LogOut size={15} className="text-white/35" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-black/7 bg-[#f6f5f1]/90 px-5 backdrop-blur-xl md:px-8 lg:px-10">
          <button className="mr-4 lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu />
          </button>
          <div className="relative hidden w-full max-w-sm md:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35"
              size={16}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, products, customers..."
              className="h-10 w-full rounded-lg border border-black/8 bg-white/70 pl-10 pr-14 text-xs outline-none focus:border-[#768978]"
            />
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-black/10 px-1.5 py-0.5 text-[10px] text-black/35">
              <Command size={10} /> K
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(value => !value)} className="relative grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Notifications">
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute right-2.5 top-2 size-2 rounded-full border-2 border-[#f6f5f1] bg-[#bd6c50]" />}
              </button>
              {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl"><div className="border-b border-black/7 px-5 py-4"><div className="text-sm font-semibold">Notifications</div><div className="mt-1 text-[10px] text-black/40">Updates automatically every 15 seconds</div></div><div className="max-h-96 overflow-y-auto">{notifications.length===0?<div className="p-8 text-center text-xs text-black/40">No recent activity</div>:notifications.map(item=><button key={item.id} onClick={()=>{if(item.type==='ORDER')setSection('Orders');else setSection('Customers');setNotificationsOpen(false);}} className="block w-full border-b border-black/5 px-5 py-4 text-left hover:bg-black/[.02]"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${item.type==='ORDER'?'bg-[#bd6c50]':'bg-[#657b69]'}`}/><span className="text-xs font-semibold">{item.title}</span><span className="ml-auto text-[9px] uppercase text-black/35">{item.type}</span></div><p className="mt-2 text-[11px] leading-4 text-black/50">{item.message}</p><div className="mt-2 text-[9px] text-black/30">{item.createdAt?new Date(item.createdAt).toLocaleString('en-EG'):'Just now'}</div></button>)}</div></div>}
            </div>
            <div className="mx-2 hidden h-6 w-px bg-black/10 sm:block" />
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold">Aura Store</div>
              <div className="text-[10px] text-black/40">Cairo, Egypt</div>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-[#d8c3a1] text-xs font-bold">
              AS
            </div>
            <ChevronDown size={14} className="text-black/40" />
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">
          {section === "Overview" && (
            <Overview
              orders={orders}
              products={products}
              overview={overview}
              onNavigate={setSection}
            />
          )}
          {section === "Orders" && (
            <OrdersView
              orders={visibleOrders}
              filter={filter}
              setFilter={setFilter}
              updateOrder={updateOrder}
            />
          )}
          {section === "Products" && (
            <ProductsView
              products={products.filter((p) =>
                p.name.toLowerCase().includes(query.toLowerCase()),
              )}
              setProducts={setProducts}
              token={token}
              openCreate={() => {
                setEditingProduct(null);
                setShowProduct(true);
              }}
              openEdit={(product) => {
                setEditingProduct(product);
                setShowProduct(true);
              }}
              notify={notify}
            />
          )}
          {section === "Customers" && <CustomersView customers={customers.filter(c => c.fullName.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()))} />}
          {section === "Discounts" && <DiscountsView discounts={discounts.filter(d => d.code.toLowerCase().includes(query.toLowerCase()))} setDiscounts={setDiscounts} token={token} notify={notify} />}
          {section === "Reviews" && <ReviewsView reviews={reviews.filter(r => r.product.nameEn.toLowerCase().includes(query.toLowerCase()) || r.user.fullName.toLowerCase().includes(query.toLowerCase()) || (r.comment && r.comment.toLowerCase().includes(query.toLowerCase())))} setReviews={setReviews} token={token} notify={notify} />}
        </main>
      </div>
      {showProduct && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          close={() => {
            setShowProduct(false);
            setEditingProduct(null);
          }}
          save={saveProduct}
          createCategory={createCategory}
          notify={notify}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl bg-[#1f2b25] px-5 py-3 text-sm text-white shadow-2xl">
          <span className="mr-2 text-[#d3b47b]">●</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function Heading({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#8d7450]">
          Aura administration
        </div>
        <h1 className="font-serif text-3xl md:text-[40px]">{title}</h1>
        <p className="mt-2 text-sm text-black/45">{copy}</p>
      </div>
      {action}
    </div>
  );
}

function Overview({
  orders,
  products,
  overview,
  onNavigate,
}: {
  orders: typeof ordersSeed;
  products: typeof productsSeed;
  overview: AdminOverview | null;
  onNavigate: (s: Section) => void;
}) {
  const cards = [
    {
      label: "Net revenue",
      value: money(overview?.revenue ?? 0),
      change: "Last 30 days",
      icon: CreditCard,
    },
    { label: "Orders", value: String(overview?.orders ?? orders.length), change: "Last 30 days", icon: ShoppingBag },
    { label: "Customers", value: String(overview?.customers ?? 0), change: "All customers", icon: Users },
    {
      label: "Avg. order value",
      value: money(overview?.averageOrderValue ?? 0),
      change: "Last 30 days",
      icon: TrendingUp,
    },
  ];
  return (
    <>
      <Heading
        title="Good morning, Hadeer"
        copy="Here’s what’s happening with your store today."
        action={
          <button
            onClick={() => onNavigate("Products")}
            className="flex h-11 items-center gap-2 rounded-lg bg-[#24352c] px-4 text-xs font-semibold text-white hover:bg-[#31483c]"
          >
            <Plus size={16} /> Add product
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, change, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-black/7 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,.02)]"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-[#edf0eb] text-[#506252]">
                <Icon size={18} />
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                {change}
              </span>
            </div>
            <div className="mt-5 text-xs text-black/42">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {value}
            </div>
            <div className="mt-2 text-[10px] text-black/35">
              vs. previous 30 days
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-black/7 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl">Revenue overview</h2>
              <p className="mt-1 text-[11px] text-black/40">
                Revenue across the last 7 months
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-black/8 px-3 py-2 text-[11px]">
              Last 7 months <ChevronDown size={13} />
            </button>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3 border-b border-black/8">
            {[44, 58, 50, 72, 66, 84, 78, 94, 88, 108, 102, 124, 118, 142].map(
              (h, i) => (
                <div
                  key={i}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    style={{ height: `${h}px` }}
                    className={`w-full rounded-t-sm ${i === 13 ? "bg-[#c49b5d]" : "bg-[#2c4035]/85"} transition hover:bg-[#c49b5d]`}
                  />
                </div>
              ),
            )}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-black/35">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>
        <div className="rounded-2xl border border-black/7 bg-[#26372f] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl">Sales by category</h2>
              <p className="mt-1 text-[11px] text-white/40">
                Live catalog overview
              </p>
            </div>
            <MoreHorizontal size={18} className="text-white/40" />
          </div>
          <div
            className="mx-auto my-6 grid size-40 place-items-center rounded-full"
            style={{
              background:
                "conic-gradient(#d1aa6a 0 38%, #899b88 38% 65%, #d9d2c5 65% 83%, #68796e 83%)",
            }}
          >
            <div className="grid size-24 place-items-center rounded-full bg-[#26372f] text-center">
              <div>
                <div className="text-[10px] text-white/45">Total sales</div>
                <div className="mt-1 text-lg font-semibold">{money(overview?.revenue ?? 0)}</div>
              </div>
            </div>
          </div>
          {[
            ["Rings", "38%", "#d1aa6a"],
            ["Necklaces", "27%", "#899b88"],
            ["Earrings", "18%", "#d9d2c5"],
            ["Bracelets", "17%", "#68796e"],
          ].map((x) => (
            <div key={x[0]} className="mb-3 flex items-center text-xs">
              <span
                className="mr-2 size-2 rounded-full"
                style={{ background: x[2] }}
              />
              <span className="text-white/65">{x[0]}</span>
              <span className="ml-auto font-semibold">{x[1]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-black/7 bg-white">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="font-serif text-xl">Recent orders</h2>
              <p className="mt-1 text-[11px] text-black/40">
                Latest purchases from your store
              </p>
            </div>
            <button
              onClick={() => onNavigate("Orders")}
              className="flex items-center gap-1 text-xs font-semibold text-[#526956]"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <OrderTable orders={orders.slice(0, 4)} />
        </div>
        <div className="rounded-2xl border border-black/7 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Inventory alerts</h2>
            <button
              onClick={() => onNavigate("Products")}
              className="text-xs font-semibold text-[#526956]"
            >
              View inventory
            </button>
          </div>
          <div className="mt-5 space-y-5">
            {products.slice(1, 4).map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div
                  className={`size-12 rounded-lg bg-gradient-to-br ${p.tone}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{p.name}</div>
                  <div className="mt-1 text-[10px] text-black/40">{p.sku}</div>
                </div>
                <div
                  className={`text-right text-xs font-bold ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}
                >
                  {p.stock}
                  <div className="text-[9px] font-normal text-black/35">
                    in stock
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("Products")}
            className="mt-6 w-full rounded-lg border border-black/8 py-2.5 text-xs font-semibold hover:bg-black/[.02]"
          >
            Manage inventory
          </button>
        </div>
      </div>
    </>
  );
}

function OrderTable({
  orders,
  editable,
  updateOrder,
}: {
  orders: typeof ordersSeed;
  editable?: boolean;
  updateOrder?: (id: string, status: OrderStatus) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-y border-black/6 bg-[#faf9f6] text-[9px] uppercase tracking-[.13em] text-black/38">
            <th className="px-6 py-3 font-semibold">Order</th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Total</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              className="border-b border-black/5 text-xs last:border-0 hover:bg-[#fbfaf7]"
            >
              <td className="px-6 py-4 font-bold">
                {o.id}
                <div className="mt-1 text-[9px] font-normal text-black/35">
                  {o.items} items
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`grid size-8 place-items-center rounded-full ${o.color} text-[10px] font-bold`}
                  >
                    {o.initials}
                  </div>
                  {o.customer}
                </div>
              </td>
              <td className="px-4 py-4 text-black/48">{o.date}</td>
              <td className="px-4 py-4 font-semibold">{money(o.total)}</td>
              <td className="px-4 py-4">
                {editable ? (
                  <select
                    value={o.status}
                    onChange={(e) =>
                      updateOrder?.(o.id, e.target.value as OrderStatus)
                    }
                    className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] outline-none"
                  >
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                ) : (
                  <Status value={o.status} />
                )}
              </td>
              <td className="px-4 py-4">
                <button>
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersView({
  orders,
  filter,
  setFilter,
  updateOrder,
}: {
  orders: typeof ordersSeed;
  filter: string;
  setFilter: (v: string) => void;
  updateOrder: (id: string, s: OrderStatus) => void;
}) {
  return (
    <>
      <Heading
        title="Orders"
        copy="Track, fulfill, and manage every customer order."
        action={
          <button className="rounded-lg border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold">
            Export orders
          </button>
        }
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((x) => (
          <button
            key={x}
            onClick={() => setFilter(x)}
            className={`rounded-full px-4 py-2 text-xs ${filter === x ? "bg-[#26372f] text-white" : "border border-black/8 bg-white text-black/55"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/7 bg-white">
        <OrderTable orders={orders} editable updateOrder={updateOrder} />
        {orders.length === 0 && (
          <div className="p-12 text-center text-sm text-black/40">
            No matching orders found.
          </div>
        )}
      </div>
    </>
  );
}

function ProductsView({
  products,
  setProducts,
  token,
  openCreate,
  openEdit,
  notify,
}: {
  products: AdminProduct[];
  setProducts: React.Dispatch<React.SetStateAction<AdminProduct[]>>;
  token: string;
  openCreate: () => void;
  openEdit: (product: AdminProduct) => void;
  notify: (s: string) => void;
}) {
  const change = async (product: AdminProduct, delta: number) => {
    if (!product.backendId) return;
    const stock = Math.max(0, product.stock + delta);
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    try {
      const response = await fetch(`${base}/products/${product.backendId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      const saved = productFromApi(body.data);
      setProducts((items) =>
        items.map((item) =>
          item.backendId === saved.backendId ? saved : item,
        ),
      );
      notify("Inventory updated");
    } catch {
      notify("Could not update inventory");
    }
  };
  return (
    <>
      <Heading
        title="Products & inventory"
        copy="Create products, adjust stock, and organize your catalog."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-[#24352c] px-4 py-3 text-xs font-semibold text-white"
          >
            <Plus size={16} /> Add product
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat
          icon={Package}
          label="Total products"
          value={String(products.length)}
        />
        <MiniStat
          icon={Boxes}
          label="Low stock"
          value={String(
            products.filter((product) => product.stock < 10).length,
          )}
        />
        <MiniStat
          icon={Sparkles}
          label="In stock"
          value={String(products.filter((product) => product.stock > 0).length)}
        />
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-black/7 bg-white">
        <div className="border-b border-black/6 p-5 text-sm font-semibold">
          All products
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#faf9f6] text-[9px] uppercase tracking-widest text-black/40">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.backendId ?? p.sku}
                  className="border-t border-black/5 text-xs"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-12 rounded-lg bg-gradient-to-br ${p.tone}`}
                      />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="mt-1 text-[10px] text-black/38">
                          {p.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-black/52">{p.category}</td>
                  <td className="font-semibold">{money(p.price)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void change(p, -1)}
                        className="grid size-7 place-items-center rounded border border-black/10"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-semibold">
                        {p.stock}
                      </span>
                      <button
                        onClick={() => void change(p, 1)}
                        className="grid size-7 place-items-center rounded border border-black/10"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <Status value={p.status} />
                  </td>
                  <td>
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="rounded-lg p-2 hover:bg-black/5"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/7 bg-white p-5">
      <div className="grid size-11 place-items-center rounded-xl bg-[#edf0eb] text-[#536858]">
        <Icon size={19} />
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-[11px] text-black/40">{label}</div>
      </div>
    </div>
  );
}

function CustomersView({ customers }: { customers: AdminCustomer[] }) {
  return (
    <>
      <Heading
        title="Customers"
        copy="Understand and support the people who shop with Aura."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={Users} label="Total customers" value={String(customers.length)} />
        <MiniStat icon={TrendingUp} label="Verified customers" value={String(customers.filter((customer) => customer.phone).length)} />
        <MiniStat icon={Gift} label="Customers shown" value={String(customers.length)} />
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-black/7 bg-white">
        <table className="w-full min-w-[650px] text-left text-xs">
          <thead className="bg-[#faf9f6] text-[9px] uppercase tracking-widest text-black/40">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th>Orders</th>
              <th>Total spent</th>
              <th>Last order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-black/5">
                <td className="px-6 py-4">
                  <div className="font-semibold">{customer.fullName}</div>
                  <div className="mt-1 text-[10px] text-black/38">{customer.email}</div>
                </td>
                <td>{customer.orders ?? 0}</td>
                <td className="font-semibold">{money(customer.totalSpent ?? 0)}</td>
                <td className="text-black/45">{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString("en-EG") : customer.createdAt ? `Joined ${new Date(customer.createdAt).toLocaleDateString("en-EG")}` : "—"}</td>
                <td>
                  <MoreHorizontal size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <div className="p-12 text-center text-sm text-black/40">No customers found.</div>}
      </div>
    </>
  );
}

function DiscountsView({ discounts, setDiscounts, token, notify }: { discounts: AdminDiscount[]; setDiscounts: React.Dispatch<React.SetStateAction<AdminDiscount[]>>; token: string; notify: (s: string) => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: "", minimumSubtotal: "", usageLimit: "", endsAt: "" });
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  const save = async () => {
    const response = await fetch(`${base}/discounts`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: form.code, type: form.type, value: Number(form.value), minimumSubtotal: form.minimumSubtotal ? Number(form.minimumSubtotal) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null, endsAt: form.endsAt || null }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Could not create discount");
    setDiscounts((items) => [body.data, ...items]); setCreating(false); setForm({ code: "", type: "PERCENTAGE", value: "", minimumSubtotal: "", usageLimit: "", endsAt: "" }); notify("Discount created");
  };
  const toggle = async (discount: AdminDiscount) => {
    const response = await fetch(`${base}/discounts/${discount.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ isActive: !discount.isActive }) });
    const body = await response.json(); if (!response.ok) { notify(body.error ?? "Could not update discount"); return; }
    setDiscounts((items) => items.map((item) => item.id === discount.id ? body.data : item));
  };
  return (
    <>
      <Heading
        title="Discounts"
        copy="Create offers that turn browsers into loyal customers."
        action={
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-[#24352c] px-4 py-3 text-xs font-semibold text-white"
          >
            <Plus size={16} /> Create discount
          </button>
        }
      />
      {creating && <div className="mb-5 grid gap-3 rounded-2xl border border-black/7 bg-white p-5 md:grid-cols-3"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className="h-10 rounded-lg border border-black/10 px-3 font-mono text-xs" /><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 rounded-lg border border-black/10 px-3 text-xs"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed EGP</option></select><input type="number" min="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Amount" className="h-10 rounded-lg border border-black/10 px-3 text-xs" /><input type="number" min="0" value={form.minimumSubtotal} onChange={(e) => setForm({ ...form, minimumSubtotal: e.target.value })} placeholder="Minimum order (EGP)" className="h-10 rounded-lg border border-black/10 px-3 text-xs" /><input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Usage limit (optional)" className="h-10 rounded-lg border border-black/10 px-3 text-xs" /><input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="h-10 rounded-lg border border-black/10 px-3 text-xs" /><div className="md:col-span-3 flex justify-end gap-2"><button onClick={() => setCreating(false)} className="rounded-lg px-4 py-2 text-xs">Cancel</button><button onClick={() => void save().catch((error: Error) => notify(error.message))} className="rounded-lg bg-[#24352c] px-4 py-2 text-xs font-semibold text-white">Save discount</button></div></div>}
      <div className="grid gap-4 lg:grid-cols-3">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="rounded-2xl border border-black/7 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-[#f3ebdc] text-[#9a733d]">
                <Tag size={18} />
              </div>
              <button
                onClick={() => void toggle(discount)}
                className={`relative h-6 w-11 rounded-full transition ${discount.isActive ? "bg-[#385243]" : "bg-black/15"}`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-full bg-white transition ${discount.isActive ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
            <div className="mt-6 font-mono text-lg font-bold tracking-wider">
              {discount.code}
            </div>
            <div className="mt-2 text-sm font-semibold">{discount.type === "PERCENTAGE" ? `${Number(discount.value)}% off` : `${money(Number(discount.value))} off`}</div>
            <div className="mt-1 text-xs text-black/42">{discount.minimumSubtotal ? `Orders over ${money(Number(discount.minimumSubtotal))}` : "No minimum order"}{discount.endsAt ? ` · Ends ${new Date(discount.endsAt).toLocaleDateString("en-EG")}` : ""}</div>
            <div className="mt-6 border-t border-black/6 pt-4 text-[11px] text-black/40">
              {discount.usedCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ""} uses
            </div>
          </div>
        ))}
      </div>
      {discounts.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-black/40">No discount codes yet.</div>}
    </>
  );
}

function ProductModal({
  product,
  categories,
  close,
  save,
  createCategory,
  notify,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  close: () => void;
  save: (p: AdminProduct) => Promise<void>;
  createCategory: (name: string) => Promise<AdminCategory>;
  notify: (message: string) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [discountPrice, setDiscountPrice] = useState(product?.discountPrice ? String(product.discountPrice) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "ACTIVE"
  );  
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const amount = Number(stock) || 0;
    const category = categories.find((item) => item.id === categoryId);
    try {
      await save({
        backendId: product?.backendId,
        name: name.trim(),
        sku: sku.trim() || `PRD-${Date.now().toString().slice(-6)}`,
        categoryId: categoryId || undefined,
        category: category?.nameEn ?? "Uncategorized",
        price: Number(price) || 0,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: amount,
        status: amount === 0 ? "OUT_OF_STOCK" : status,
        tone: product?.tone ?? "from-[#c9aa6a] to-[#efe0b8]",
      });
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Could not save the product",
      );
      setSaving(false);
    }
  };
  const addCategory = async () => {
    const value = newCategory.trim();
    if (!value) return;
    setAddingCategory(true);
    try {
      const category = await createCategory(value);
      setCategoryId(category.id);
      setNewCategory("");
      notify("Category created");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "Could not create category",
      );
    } finally {
      setAddingCategory(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#17201b]/55 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-2xl bg-[#faf9f6] p-7 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl">
              {product ? "Edit product" : "Add a new product"}
            </h2>
            <p className="mt-1 text-xs text-black/40">
              {product
                ? "Update its catalog details, category, and inventory."
                : "Create a catalog item and set its opening stock."}
            </p>
          </div>
          <button type="button" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <div className="mt-7 space-y-4">
          <label className="block text-xs font-semibold">
            Product name
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal outline-none focus:border-[#667d6b]"
              placeholder="e.g. Hammered Gold Ring"
              required
            />
          </label>
          <label className="block text-xs font-semibold">
            SKU
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal outline-none focus:border-[#667d6b]"
              placeholder="Generated automatically if empty"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-xs font-semibold">
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nameEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold">
              Price (EGP)
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal"
                required
              />
            </label>
          </div>
          <label className="block text-xs font-semibold">
            Sale price (EGP, optional)
            <input
              type="number"
              min="0"
              step="0.01"
              max={price || undefined}
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal"
              placeholder="Leave empty for no product sale"
            />
          </label>
          <div>
            <div className="text-xs font-semibold">Create a category</div>
            <div className="mt-2 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 text-xs font-normal"
                placeholder="e.g. Rings"
              />
              <button
                type="button"
                disabled={addingCategory || !newCategory.trim()}
                onClick={() => void addCategory()}
                className="rounded-lg border border-black/10 px-4 text-xs font-semibold disabled:opacity-40"
              >
                {addingCategory ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
          <label className="block text-xs font-semibold">
            Stock
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => {
                const value = e.target.value;
                setStock(value);

                if (Number(value) === 0) {
                  setStatus("OUT_OF_STOCK");
                } else if (status === "OUT_OF_STOCK") {
                  setStatus("ACTIVE");
                }
              }}
              className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3 font-normal"
              required
            />
          </label>
          <label className="block text-xs font-semibold">
            Status

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              disabled={Number(stock) === 0}
              className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-white px-3"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </label>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-black/10 px-5 py-2.5 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-[#24352c] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewsView({ reviews, setReviews, token, notify }: { reviews: AdminReview[]; setReviews: React.Dispatch<React.SetStateAction<AdminReview[]>>; token: string; notify: (s: string) => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const removeReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setDeleting(id);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const response = await fetch(`${base}/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete review");
      setReviews(v => v.filter(r => r.id !== id));
      notify("Review deleted successfully");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Error deleting review");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading title="Reviews" copy="Monitor and manage customer reviews." />
      <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fcfbf9] text-xs uppercase tracking-wider text-black/50 border-b border-black/5">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Rating</th>
                <th className="px-6 py-4 font-semibold">Comment</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {reviews.map(review => (
                <tr key={review.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-6 py-4 font-medium">{review.product.nameEn}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{review.user.fullName}</div>
                    <div className="text-xs text-black/40">{review.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5 text-[#d1ae68]">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-black/70" title={review.comment || ""}>
                      {review.comment || <span className="text-black/30 italic">No comment</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black/60">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeReview(review.id)}
                      disabled={deleting === review.id}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      {deleting === review.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black/40">No reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

