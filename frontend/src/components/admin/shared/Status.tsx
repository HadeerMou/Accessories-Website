export function Status({ value }: { value: string }) {
  const style =
    value === "Delivered" || value === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : value === "Shipped"
        ? "bg-blue-50 text-blue-700"
        : value === "Processing" || value === "DRAFT"
          ? "bg-amber-50 text-amber-700"
          : "bg-rose-50 text-rose-700";

  const label =
    value === "ACTIVE"
      ? "Active"
      : value === "Delivered"
      ? "Delivered"
      : value === "Shipped"
      ? "Shipped"
      : value === "DRAFT"
      ? "Draft"
      : value === "Processing"
      ? "Processing"
      : "Out of stock";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
