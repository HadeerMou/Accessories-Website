import { MoreHorizontal } from "lucide-react";

import { money } from "@/lib/admin/formatters";
import type { AdminOrder, OrderStatus } from "@/lib/admin/types";
import { Status } from "@/components/admin/shared/Status";

export function OrderTable({
  orders,
  editable,
  updateOrder,
}: {
  orders: AdminOrder[];
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
