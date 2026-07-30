import {
  Gift,
  MoreHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";

import { Heading } from "@/components/admin/shared/Heading";
import { MiniStat } from "@/components/admin/shared/MiniStat";
import { money } from "@/lib/admin/formatters";
import type { AdminCustomer } from "@/lib/admin/types";

export function CustomersView({ customers }: { customers: AdminCustomer[] }) {
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
                <td className="text-black/45">
                  {customer.lastOrder
                    ? new Date(customer.lastOrder).toLocaleDateString(
                        "en-EG",
                      )
                    : customer.createdAt
                      ? `Joined ${new Date(
                          customer.createdAt,
                        ).toLocaleDateString("en-EG")}`
                      : "—"}
                </td>
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
