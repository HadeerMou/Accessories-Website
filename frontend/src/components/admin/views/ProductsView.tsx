"use client";

import type * as React from "react";
import {
  Boxes,
  MoreHorizontal,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";

import { Heading } from "@/components/admin/shared/Heading";
import { MiniStat } from "@/components/admin/shared/MiniStat";
import { Status } from "@/components/admin/shared/Status";
import { API_BASE } from "@/lib/admin/api";
import { money } from "@/lib/admin/formatters";
import { productFromApi } from "@/lib/admin/mappers";
import type { AdminProduct } from "@/lib/admin/types";

export function ProductsView({
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
    const base = API_BASE;
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
