import { Heading } from "@/components/admin/shared/Heading";
import { OrderTable } from "@/components/admin/shared/OrderTable";
import type { AdminOrder, OrderStatus } from "@/lib/admin/types";

export function OrdersView({
  orders,
  filter,
  setFilter,
  updateOrder,
}: {
  orders: AdminOrder[];
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
