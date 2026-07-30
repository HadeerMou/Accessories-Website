import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { Heading } from "@/components/admin/shared/Heading";
import { OrderTable } from "@/components/admin/shared/OrderTable";
import { money } from "@/lib/admin/formatters";
import type {
  AdminOrder,
  AdminOverview,
  AdminProduct,
  Section,
} from "@/lib/admin/types";

export function OverviewView({
  orders,
  products,
  overview,
  onNavigate,
}: {
  orders: AdminOrder[];
  products: AdminProduct[];
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
