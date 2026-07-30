"use client";

import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";

import type { AdminOrder, Section } from "@/lib/admin/types";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Orders", icon: ShoppingBag },
  { label: "Products", icon: Package },
  { label: "Customers", icon: Users },
  { label: "Discounts", icon: Tag },
  { label: "Reviews", icon: Star },
] satisfies Array<{
  label: Section;
  icon: typeof LayoutDashboard;
}>;

type AdminSidebarProps = {
  section: Section;
  mobileNav: boolean;
  orders: AdminOrder[];
  onClose: () => void;
  onNavigate: (section: Section) => void;
  onLogout: () => void;
};

export function AdminSidebar({
  section,
  mobileNav,
  orders,
  onClose,
  onNavigate,
  onLogout,
}: AdminSidebarProps) {
  const pendingOrdersCount = orders.filter(
    (order) => order.status === "Processing",
  ).length;

  return (
    <>
      {mobileNav && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-black/8 bg-[#1f2b25] text-white transition-transform lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-7">
          <div>
            <div className="font-serif text-2xl tracking-[.18em]">AURA</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[.28em] text-white/45">
              Administration
            </div>
          </div>

          <button className="lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-7">
          <div className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[.18em] text-white/35">
            Workspace
          </div>

          {navItems.map(({ label, icon: Icon }) => {
            const badge =
              label === "Orders" && pendingOrdersCount > 0
                ? String(pendingOrdersCount)
                : undefined;

            return (
              <button
                key={label}
                onClick={() => onNavigate(label)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                  section === label
                    ? "bg-white text-[#203028] shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span className="flex-1 text-left">{label}</span>

                {badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      section === label
                        ? "bg-[#203028] text-white"
                        : "bg-[#cba66b] text-[#203028]"
                    }`}
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
            onClick={onLogout}
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
    </>
  );
}
