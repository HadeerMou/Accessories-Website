"use client";

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

import { AdminSearch } from "@/components/admin/AdminSearch";

import type {
  AdminNotification,
  AdminSearchSuggestion,
  Section,
} from "@/lib/admin/types";

type AdminHeaderProps = {
  query: string;
  searchSuggestions: AdminSearchSuggestion[];
  isSearchDebouncing: boolean;
  notifications: AdminNotification[];
  notificationsOpen: boolean;
  onOpenNavigation: () => void;
  onQueryChange: (value: string) => void;
  onSelectSearchSuggestion: (
    suggestion: AdminSearchSuggestion,
  ) => void;
  onToggleNotifications: () => void;
  onCloseNotifications: () => void;
  onNavigate: (section: Section) => void;
};

export function AdminHeader({
  query,
  searchSuggestions,
  isSearchDebouncing,
  notifications,
  notificationsOpen,
  onOpenNavigation,
  onQueryChange,
  onSelectSearchSuggestion,
  onToggleNotifications,
  onCloseNotifications,
  onNavigate,
}: AdminHeaderProps) {
  const openNotification = (
    notification: AdminNotification,
  ) => {
    onNavigate(
      notification.type === "ORDER"
        ? "Orders"
        : "Customers",
    );

    onCloseNotifications();
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-black/7 bg-[#f6f5f1]/90 px-5 backdrop-blur-xl md:px-8 lg:px-10">
      <button
        type="button"
        className="mr-4 lg:hidden"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
      >
        <Menu />
      </button>

      <AdminSearch
        query={query}
        suggestions={searchSuggestions}
        isDebouncing={isSearchDebouncing}
        onQueryChange={onQueryChange}
        onSelectSuggestion={onSelectSearchSuggestion}
      />

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative grid size-10 place-items-center rounded-full hover:bg-black/5"
            aria-label="Notifications"
          >
            <Bell size={18} />

            {notifications.length > 0 && (
              <span className="absolute right-2.5 top-2 size-2 rounded-full border-2 border-[#f6f5f1] bg-[#bd6c50]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl">
              <div className="border-b border-black/7 px-5 py-4">
                <div className="text-sm font-semibold">
                  Notifications
                </div>

                <div className="mt-1 text-[10px] text-black/40">
                  Updates automatically every 15 seconds
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-black/40">
                    No recent activity
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openNotification(item)}
                      className="block w-full border-b border-black/5 px-5 py-4 text-left hover:bg-black/[.02]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            item.type === "ORDER"
                              ? "bg-[#bd6c50]"
                              : "bg-[#657b69]"
                          }`}
                        />

                        <span className="text-xs font-semibold">
                          {item.title}
                        </span>

                        <span className="ml-auto text-[9px] uppercase text-black/35">
                          {item.type}
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] leading-4 text-black/50">
                        {item.message}
                      </p>

                      <div className="mt-2 text-[9px] text-black/30">
                        {item.createdAt
                          ? new Date(
                              item.createdAt,
                            ).toLocaleString("en-EG")
                          : "Just now"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mx-2 hidden h-6 w-px bg-black/10 sm:block" />

        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold">
            Aura Store
          </div>

          <div className="text-[10px] text-black/40">
            Cairo, Egypt
          </div>
        </div>

        <div className="grid size-9 place-items-center rounded-full bg-[#d8c3a1] text-xs font-bold">
          AS
        </div>

        <ChevronDown
          size={14}
          className="text-black/40"
        />
      </div>
    </header>
  );
}