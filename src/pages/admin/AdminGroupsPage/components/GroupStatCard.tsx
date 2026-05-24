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
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-sand-500">
          {card.title}
        </span>
        <div className={card.warning ? "text-amber-600" : "text-sand-500"}>
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold tracking-tight text-sand-900">
          {card.value}
        </h3>
        <span
          className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${
            card.warning
              ? "bg-amber-50 text-amber-600"
              : "bg-sage-50 text-sage-700"
          }`}
        >
          {card.change}
        </span>
      </div>
    </div>
  );
}
