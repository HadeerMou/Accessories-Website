import type { LucideIcon } from "lucide-react";

export function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-black/7 bg-white p-5">
      <div className="grid size-11 place-items-center rounded-xl bg-[#edf0eb] text-[#536858]">
        <Icon size={19} />
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-[11px] text-black/40">{label}</div>
      </div>
    </div>
  );
}
