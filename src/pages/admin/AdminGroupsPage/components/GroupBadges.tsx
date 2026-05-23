import type { GroupStatus, GroupType } from "../types";

export function GroupTypeBadge({ type }: { type: GroupType }) {
  const isCommunity = type === "COMMUNITY";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        isCommunity
          ? "bg-accent-50 text-accent-700"
          : "bg-sand-100 text-sand-700"
      }`}
    >
      {isCommunity ? "Cộng đồng" : "Nhóm riêng"}
    </span>
  );
}

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const styles: Record<GroupStatus, string> = {
    ACTIVE: "bg-sage-50 text-sage-700",
    INACTIVE: "bg-amber-50 text-amber-700",
    ARCHIVED: "bg-sand-200 text-sand-600",
    DELETED: "bg-rose-50 text-rose-700",
  };

  const labels: Record<GroupStatus, string> = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Bị khóa",
    ARCHIVED: "Lưu trữ",
    DELETED: "Đã xóa",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
