"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, LoaderCircle, ShoppingBag } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { API_URL, customerToken, type StoreProduct } from "@/lib/api";
import { getWishlistIds, toggleWishlistItem } from "@/lib/wishlist";
import { mockProducts } from "@/lib/mock-products";

export default function StoreProductGrid({
  limit,
  collection,
  compact = false,
}: {
  limit?: number;
  collection?: "women" | "men" | "sale";
  compact?: boolean;
}) {
  const locale = useLocale();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [message, setMessage] = useState("");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/products?status=ACTIVE&limit=${limit ?? 50}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            body.detail ?? body.error ?? "Could not load products",
          );
        const data = body.data as StoreProduct[];
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(mockProducts);
        }
        setError("");
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") {
          setProducts(mockProducts);
          setError("");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [limit]);
  useEffect(() => {
    const syncWishlist = () => setWishlistIds(getWishlistIds());
    syncWishlist();
    window.addEventListener("aura-wishlist-change", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("aura-wishlist-change", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, []);
  const categories = ["all", "rings", "necklaces", "bracelets", "earrings"];
  const visible = useMemo(
    () =>
      products
        .filter((p) => {
          if (collection === "sale" && !p.discountPrice) return false;
          if (category === "all") return true;
          return p.category?.nameEn
            .toLowerCase()
            .includes(category.slice(0, -1));
        })
        .slice(0, limit),
    [products, category, collection, limit],
  );
  const addToCart = async (product: StoreProduct) => {
    const token = customerToken();
    if (!token) {
      window.dispatchEvent(new Event("aura-open-auth"));
      return;
    }
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Could not add to bag");
      setMessage(
        locale === "ar" ? "تمت الإضافة إلى السلة" : "Added to your bag",
      );
      window.setTimeout(() => setMessage(""), 2200);
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Could not add to bag",
      );
    }
  };
  const toggleFavorite = (product: StoreProduct) => {
    const added = toggleWishlistItem(product.id);
    setWishlistIds((current) =>
      added
        ? [...current, product.id]
        : current.filter((id) => id !== product.id),
    );
    setMessage(
      added
        ? locale === "ar"
          ? "تمت الإضافة إلى المفضلة"
          : "Added to favorites"
        : locale === "ar"
          ? "تمت إزالة المنتج من المفضلة"
          : "Removed from favorites",
    );
    window.setTimeout(() => setMessage(""), 2200);
  };
  if (loading)
    return (
      <div className="grid min-h-60 place-items-center text-black/35">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-8 text-center text-sm text-rose-700">
        <div>We couldn’t load the collection.</div>
        <div className="mt-2 text-xs opacity-70">{error}</div>
      </div>
    );
  return (
    <>
      {!compact && (
        <div className="mb-12 flex gap-8 overflow-x-auto whitespace-nowrap border-b border-[#2C2A28]/20 pb-4">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`text-xs uppercase tracking-widest transition ${category === item ? "text-[#2C2A28]" : "text-[#2C2A28]/45 hover:text-[#2C2A28]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => {
          const image =
            product.images.find((i) => i.isPrimary) ?? product.images[0];
          const name = locale === "ar" ? product.nameAr : product.nameEn;
          const price = Number(product.discountPrice ?? product.price);
          const isFavorite = wishlistIds.includes(product.id);
          return (
            <article key={product.id} className="group mb-7">
              <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#e8e2d8]">
                <Link
                  href={`/${locale}/product/${product.id}`}
                  className="block h-full w-full"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${JSON.stringify(image?.imageUrl ?? "").slice(1, -1)})`,
                    }}
                  />
                  {!image && (
                    <div className="grid h-full place-items-center font-serif text-2xl text-black/20">
                      Aura
                    </div>
                  )}
                </Link>
                <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={(product.stock ?? 0) < 1}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#26372f] text-[10px] font-semibold uppercase tracking-wider text-white disabled:bg-black/35"
                  >
                    <ShoppingBag size={14} />
                    {(product.stock ?? 0) < 1 ? "Sold out" : "Add to bag"}
                  </button>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleFavorite(product);
                    }}
                    aria-label={`Save ${name}`}
                    className={`grid size-10 place-items-center rounded-full ${isFavorite ? "bg-[#26372f] text-white" : "bg-white text-[#2C2A28]"}`}
                  >
                    <Heart
                      size={15}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                {product.discountPrice && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#8b5140] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                    Sale
                  </span>
                )}
              </div>
              <Link
                href={`/${locale}/product/${product.id}`}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div>
                  <h3>{name}</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-black/38">
                    {locale === "ar"
                      ? product.category?.nameAr
                      : product.category?.nameEn}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-black/65">
                    {new Intl.NumberFormat(
                      locale === "ar" ? "ar-EG" : "en-EG",
                      {
                        style: "currency",
                        currency: "EGP",
                        maximumFractionDigits: 0,
                      },
                    ).format(price)}
                  </span>
                  {product.discountPrice && (
                    <div className="text-[10px] text-black/35 line-through">
                      {Number(product.price).toFixed(0)}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="py-20 text-center font-serif text-2xl text-black/35">
          No pieces in this collection yet.
        </div>
      )}
      {message && (
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#26372f] px-5 py-3 text-xs text-white shadow-xl">
          {message}
        </div>
      )}
    </>
  );
}
