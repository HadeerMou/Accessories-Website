"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { AdminSearchSuggestion } from "@/lib/admin/types";
import { API_BASE, authHeaders } from "@/lib/admin/api";
import {
  customerFromApi,
  orderFromApi,
  productFromApi,
} from "@/lib/admin/mappers";
import type {
  AdminCategory,
  AdminCustomer,
  AdminDiscount,
  AdminNotification,
  AdminOrder,
  AdminOverview,
  AdminProduct,
  AdminReview,
  OrderStatus,
  Section,
} from "@/lib/admin/types";

const TOKEN_KEY = "aura_admin_token";

export function useAdminDashboard() {
  const [section, setSection] = useState<Section>("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showProduct, setShowProduct] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [toast, setToast] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [notifications, setNotifications] = useState<
    AdminNotification[]
  >([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const debouncedQuery = useDebounce(query.trim(), 300);

  const isSearchDebouncing =
    query.trim() !== debouncedQuery;

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToken(window.localStorage.getItem(TOKEN_KEY));
      setCheckingAuth(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;

    const headers = authHeaders(token);

    Promise.all([
      fetch(
        `${API_BASE}/products?limit=50&search=${encodeURIComponent(
          debouncedQuery,
        )}`,
        { headers },
      ),
      fetch(`${API_BASE}/orders?limit=50`, { headers }),
      fetch(`${API_BASE}/categories`, { headers }),
      fetch(`${API_BASE}/users?role=CUSTOMER&limit=50`, { headers }),
      fetch(`${API_BASE}/discounts`, { headers }),
      fetch(`${API_BASE}/reviews`, { headers }),
      fetch(`${API_BASE}/admin/overview`, { headers }),
    ])
      .then(
        async ([
          productsResponse,
          ordersResponse,
          categoriesResponse,
          customersResponse,
          discountsResponse,
          reviewsResponse,
          overviewResponse,
        ]) => {
          if (
            [productsResponse, ordersResponse].some((response) =>
              [401, 403].includes(response.status),
            )
          ) {
            window.localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            return;
          }

          if (productsResponse.ok) {
            const body = await productsResponse.json();
            setProducts(body.data.map(productFromApi));
          }

          if (ordersResponse.ok) {
            const body = await ordersResponse.json();
            setOrders(body.data.map(orderFromApi));
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
            setCustomers(body.data.map(customerFromApi));
          }

          if (discountsResponse.ok) {
            setDiscounts((await discountsResponse.json()).data);
          }

          if (reviewsResponse.ok) {
            setReviews((await reviewsResponse.json()).data);
          }

          if (overviewResponse.ok) {
            setOverview((await overviewResponse.json()).data);
          }
        },
      )
      .catch(() => {
        notify("Backend is unavailable — showing cached dashboard data");
      });
  }, [token, debouncedQuery, notify]);

  useEffect(() => {
    if (!token) return;

    const headers = authHeaders(token);

    const refresh = async () => {
      const [notificationResponse, orderResponse] = await Promise.all([
        fetch(`${API_BASE}/admin/notifications`, { headers }),
        fetch(`${API_BASE}/orders?limit=50`, { headers }),
      ]);

      if (notificationResponse.ok) {
        setNotifications((await notificationResponse.json()).data);
      }

      if (orderResponse.ok) {
        const body = await orderResponse.json();
        setOrders(body.data.map(orderFromApi));
      }
    };

    void refresh();

    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [token]);

  const visibleOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (filter === "All" || order.status === filter) &&
          `${order.id} ${order.customer}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [orders, query, filter],
  );

  const searchSuggestions = useMemo<AdminSearchSuggestion[]>(() => {
    const searchTerm = debouncedQuery.toLowerCase();

    if (searchTerm.length < 2) {
      return [];
    }

    const includesSearchTerm = (
      ...values: Array<string | number | null | undefined>
    ) =>
      values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchTerm),
      );

    const productSuggestions: AdminSearchSuggestion[] = products
      .filter((product) =>
        includesSearchTerm(
          product.name,
          product.sku,
          product.category,
        ),
      )
      .slice(0, 4)
      .map((product) => ({
        id: `product-${product.backendId ?? product.sku}`,
        section: "Products",
        title: product.name,
        subtitle: `${product.sku} · ${product.category}`,
        searchValue: product.name,
      }));

    const orderSuggestions: AdminSearchSuggestion[] = orders
      .filter((order) =>
        includesSearchTerm(
          order.id,
          order.customer,
          order.status,
        ),
      )
      .slice(0, 3)
      .map((order) => ({
        id: `order-${order.backendId ?? order.id}`,
        section: "Orders",
        title: order.id,
        subtitle: `${order.customer} · ${order.status}`,
        searchValue: order.id,
      }));

    const customerSuggestions: AdminSearchSuggestion[] = customers
      .filter((customer) =>
        includesSearchTerm(
          customer.fullName,
          customer.email,
          customer.phone,
        ),
      )
      .slice(0, 3)
      .map((customer) => ({
        id: `customer-${customer.id}`,
        section: "Customers",
        title: customer.fullName,
        subtitle: customer.email,
        searchValue: customer.fullName,
      }));

    return [
      ...productSuggestions,
      ...orderSuggestions,
      ...customerSuggestions,
    ].slice(0, 8);
  }, [
    debouncedQuery,
    products,
    orders,
    customers,
  ]);

  const login = useCallback((value: string) => {
    window.localStorage.setItem(TOKEN_KEY, value);
    setToken(value);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const navigateFromSidebar = useCallback((nextSection: Section) => {
    setSection(nextSection);
    setMobileNav(false);
    setQuery("");
    setFilter("All");
  }, []);

  const updateOrder = useCallback(
    (id: string, status: OrderStatus) => {
      const selected = orders.find((order) => order.id === id);

      setOrders((items) =>
        items.map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      );

      if (!selected?.backendId || !token) {
        notify(`${id} updated to ${status}`);
        return;
      }

      fetch(`${API_BASE}/orders/${selected.backendId}`, {
        method: "PUT",
        headers: authHeaders(token, true),
        body: JSON.stringify({
          orderStatus: status.toUpperCase().replace(" ", "_"),
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error();
          notify(`${id} updated to ${status}`);
        })
        .catch(() => notify("Could not save the order update"));
    },
    [notify, orders, token],
  );

  const saveProduct = useCallback(
    async (product: AdminProduct) => {
      if (!token) throw new Error("Your session has expired");

      const current = editingProduct;
      const response = await fetch(
        `${API_BASE}/products${
          current?.backendId ? `/${current.backendId}` : ""
        }`,
        {
          method: current?.backendId ? "PATCH" : "POST",
          headers: authHeaders(token, true),
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

      if (!response.ok) {
        throw new Error(body.error ?? "Could not save the product");
      }

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
    },
    [editingProduct, notify, token],
  );

  const createCategory = useCallback(
    async (name: string) => {
      if (!token) throw new Error("Your session has expired");

      const response = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: authHeaders(token, true),
        body: JSON.stringify({ nameEn: name, nameAr: name }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Could not create the category");
      }

      const category = {
        id: String(body.data.id),
        nameEn: String(body.data.nameEn),
      };

      setCategories((items) =>
        [...items, category].sort((a, b) =>
          a.nameEn.localeCompare(b.nameEn),
        ),
      );

      return category;
    },
    [token],
  );

  const openCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setShowProduct(true);
  }, []);

  const openEditProduct = useCallback((product: AdminProduct) => {
    setEditingProduct(product);
    setShowProduct(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setShowProduct(false);
    setEditingProduct(null);
  }, []);

  return {
    section,
    setSection,
    mobileNav,
    setMobileNav,
    orders,
    visibleOrders,
    products,
    setProducts,
    customers,
    discounts,
    setDiscounts,
    reviews,
    setReviews,
    overview,
    query,
    setQuery,
    searchSuggestions,
    isSearchDebouncing,
    filter,
    setFilter,
    showProduct,
    editingProduct,
    categories,
    toast,
    token,
    checkingAuth,
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notify,
    login,
    logout,
    navigateFromSidebar,
    updateOrder,
    saveProduct,
    createCategory,
    openCreateProduct,
    openEditProduct,
    closeProductModal,
  };
}
