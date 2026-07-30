"use client";

import type * as React from "react";
import { useState } from "react";
import { Plus, Tag } from "lucide-react";

import { Heading } from "@/components/admin/shared/Heading";
import { API_BASE, authHeaders } from "@/lib/admin/api";
import { money } from "@/lib/admin/formatters";
import type { AdminDiscount } from "@/lib/admin/types";

type DiscountsViewProps = {
  discounts: AdminDiscount[];
  setDiscounts: React.Dispatch<
    React.SetStateAction<AdminDiscount[]>
  >;
  token: string;
  notify: (message: string) => void;
};

const emptyForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minimumSubtotal: "",
  usageLimit: "",
  endsAt: "",
};

export function DiscountsView({
  discounts,
  setDiscounts,
  token,
  notify,
}: DiscountsViewProps) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const save = async () => {
    const response = await fetch(`${API_BASE}/discounts`, {
      method: "POST",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minimumSubtotal: form.minimumSubtotal
          ? Number(form.minimumSubtotal)
          : null,
        usageLimit: form.usageLimit
          ? Number(form.usageLimit)
          : null,
        endsAt: form.endsAt || null,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error ?? "Could not create discount");
    }

    setDiscounts((items) => [body.data, ...items]);
    setCreating(false);
    setForm(emptyForm);
    notify("Discount created");
  };

  const toggle = async (discount: AdminDiscount) => {
    const response = await fetch(
      `${API_BASE}/discounts/${discount.id}`,
      {
        method: "PATCH",
        headers: authHeaders(token, true),
        body: JSON.stringify({
          isActive: !discount.isActive,
        }),
      },
    );

    const body = await response.json();

    if (!response.ok) {
      notify(body.error ?? "Could not update discount");
      return;
    }

    setDiscounts((items) =>
      items.map((item) =>
        item.id === discount.id ? body.data : item,
      ),
    );
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

      {creating && (
        <div className="mb-5 grid gap-3 rounded-2xl border border-black/7 bg-white p-5 md:grid-cols-3">
          <input
            value={form.code}
            onChange={(event) =>
              setForm({
                ...form,
                code: event.target.value.toUpperCase(),
              })
            }
            placeholder="CODE"
            className="h-10 rounded-lg border border-black/10 px-3 font-mono text-xs"
          />

          <select
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value })
            }
            className="h-10 rounded-lg border border-black/10 px-3 text-xs"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed EGP</option>
          </select>

          <input
            type="number"
            min="0.01"
            value={form.value}
            onChange={(event) =>
              setForm({ ...form, value: event.target.value })
            }
            placeholder="Amount"
            className="h-10 rounded-lg border border-black/10 px-3 text-xs"
          />

          <input
            type="number"
            min="0"
            value={form.minimumSubtotal}
            onChange={(event) =>
              setForm({
                ...form,
                minimumSubtotal: event.target.value,
              })
            }
            placeholder="Minimum order (EGP)"
            className="h-10 rounded-lg border border-black/10 px-3 text-xs"
          />

          <input
            type="number"
            min="1"
            value={form.usageLimit}
            onChange={(event) =>
              setForm({
                ...form,
                usageLimit: event.target.value,
              })
            }
            placeholder="Usage limit (optional)"
            className="h-10 rounded-lg border border-black/10 px-3 text-xs"
          />

          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(event) =>
              setForm({ ...form, endsAt: event.target.value })
            }
            className="h-10 rounded-lg border border-black/10 px-3 text-xs"
          />

          <div className="flex justify-end gap-2 md:col-span-3">
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                void save().catch((error: Error) =>
                  notify(error.message),
                )
              }
              className="rounded-lg bg-[#24352c] px-4 py-2 text-xs font-semibold text-white"
            >
              Save discount
            </button>
          </div>
        </div>
      )}

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
                className={`relative h-6 w-11 rounded-full transition ${
                  discount.isActive
                    ? "bg-[#385243]"
                    : "bg-black/15"
                }`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-full bg-white transition ${
                    discount.isActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 font-mono text-lg font-bold tracking-wider">
              {discount.code}
            </div>

            <div className="mt-2 text-sm font-semibold">
              {discount.type === "PERCENTAGE"
                ? `${Number(discount.value)}% off`
                : `${money(Number(discount.value))} off`}
            </div>

            <div className="mt-1 text-xs text-black/42">
              {discount.minimumSubtotal
                ? `Orders over ${money(
                    Number(discount.minimumSubtotal),
                  )}`
                : "No minimum order"}
              {discount.endsAt
                ? ` · Ends ${new Date(
                    discount.endsAt,
                  ).toLocaleDateString("en-EG")}`
                : ""}
            </div>

            <div className="mt-6 border-t border-black/6 pt-4 text-[11px] text-black/40">
              {discount.usedCount}
              {discount.usageLimit
                ? ` / ${discount.usageLimit}`
                : ""}{" "}
              uses
            </div>
          </div>
        ))}
      </div>

      {discounts.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-black/40">
          No discount codes yet.
        </div>
      )}
    </>
  );
}
