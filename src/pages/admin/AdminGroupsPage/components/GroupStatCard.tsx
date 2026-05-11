import React from "react";

export function GroupStatCard({
  card,
}: {
  card: {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ size?: number }>;
    warning?: boolean;
  };
}) {
  const Icon = card.icon;

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {card.title}
        </span>
        <div className={card.warning ? "text-orange-500" : "text-blue-600"}>
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-gray-900">
          {card.value}
        </h3>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            card.warning
              ? "bg-orange-50 text-orange-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {card.change}
        </span>
      </div>
    </div>
  );
}
