import type { LucideIcon } from "lucide-react";

type UserStatCardProps = {
  title: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  iconClassName: string;
};

export function UserStatCard({
  title,
  value,
  caption,
  icon: Icon,
  iconClassName,
}: UserStatCardProps) {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-sand-500">
          {title}
        </span>
        <div className={iconClassName}>
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold tracking-tight text-sand-900">
          {value}
        </h3>
        <span className="rounded-md bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-600">
          {caption}
        </span>
      </div>
    </div>
  );
}
