"use client";

import type * as React from "react";
import { useState } from "react";
import { X } from "lucide-react";

import type {
  AdminCategory,
  AdminProduct,
  ProductStatus,
} from "@/lib/admin/types";

export function ProductModal({
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
