"use client";

import {
  Command,
  Package,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AdminSearchSuggestion,
  SearchableAdminSection,
} from "@/lib/admin/types";

type AdminSearchProps = {
  query: string;
  suggestions: AdminSearchSuggestion[];
  isDebouncing: boolean;
  onQueryChange: (value: string) => void;
  onSelectSuggestion: (
    suggestion: AdminSearchSuggestion,
  ) => void;
};

const sectionIcons = {
  Products: Package,
  Orders: ShoppingBag,
  Customers: Users,
} satisfies Record<
  SearchableAdminSection,
  typeof Package
>;

export function AdminSearch({
  query,
  suggestions,
  isDebouncing,
  onQueryChange,
  onSelectSuggestion,
}: AdminSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const canShowSuggestions =
    open && query.trim().length >= 2;

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLocaleLowerCase() === "k";

      if (!isSearchShortcut) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut,
      );
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (
      event: PointerEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    };

    window.addEventListener(
      "pointerdown",
      handleOutsideClick,
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleOutsideClick,
      );
    };
  }, []);

  const selectSuggestion = (
    suggestion: AdminSearchSuggestion,
  ) => {
    onSelectSuggestion(suggestion);
    setOpen(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);

      setActiveIndex((current) =>
        current >= suggestions.length - 1
          ? 0
          : current + 1,
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);

      setActiveIndex((current) =>
        current <= 0
          ? suggestions.length - 1
          : current - 1,
      );

      return;
    }

    if (
      event.key === "Enter" &&
      canShowSuggestions
    ) {
      event.preventDefault();

      const suggestion = suggestions[activeIndex];

      if (suggestion) {
        selectSuggestion(suggestion);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden w-full max-w-sm md:block"
    >
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35"
        size={16}
      />

      <input
        ref={inputRef}
        value={query}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={canShowSuggestions}
        aria-controls="admin-search-suggestions"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search orders, products, customers..."
        className="h-10 w-full rounded-lg border border-black/8 bg-white/70 pl-10 pr-14 text-xs outline-none transition focus:border-[#768978] focus:bg-white"
      />

      <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-black/10 px-1.5 py-0.5 text-[10px] text-black/35">
        <Command size={10} />
        K
      </span>

      {canShowSuggestions && (
        <div
          id="admin-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-2xl"
        >
          <div className="border-b border-black/5 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-black/35">
              Search results
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {isDebouncing ? (
              <div className="px-4 py-8 text-center text-xs text-black/40">
                Searching...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-medium text-black/60">
                  No results found
                </p>
                <p className="mt-1 text-[10px] text-black/35">
                  Try a product name, order number, or
                  customer name.
                </p>
              </div>
            ) : (
              suggestions.map(
                (suggestion, index) => {
                  const Icon =
                    sectionIcons[suggestion.section];

                  const active =
                    index === activeIndex;

                  return (
                    <button
                      key={suggestion.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() =>
                        setActiveIndex(index)
                      }
                      onClick={() =>
                        selectSuggestion(suggestion)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-[#edf0eb]"
                          : "hover:bg-black/[.03]"
                      }`}
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#26372f] text-white">
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">
                          {suggestion.title}
                        </div>

                        <div className="mt-1 truncate text-[10px] text-black/40">
                          {suggestion.subtitle}
                        </div>
                      </div>

                      <span className="rounded-full bg-black/5 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-black/40">
                        {suggestion.section}
                      </span>
                    </button>
                  );
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}