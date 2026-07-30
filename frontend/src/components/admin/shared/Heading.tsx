import type * as React from "react";

export function Heading({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#8d7450]">
          Aura administration
        </div>
        <h1 className="font-serif text-3xl md:text-[40px]">{title}</h1>
        <p className="mt-2 text-sm text-black/45">{copy}</p>
      </div>
      {action}
    </div>
  );
}
