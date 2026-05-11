import type { GroupStatus, GroupType } from "../types";

export function GroupTypeBadge({ type }: { type: GroupType }) {
  const isCommunity = type === "COMMUNITY";

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
        isCommunity
          ? "bg-blue-50 text-blue-700"
          : "bg-violet-50 text-violet-700"
      }`}
    >
      {isCommunity ? "Cộng đồng" : "Nhóm riêng"}
    </span>
  );
}

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const styles: Record<GroupStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    ARCHIVED: "bg-amber-50 text-amber-700",
    DELETED: "bg-red-50 text-red-700",
  };

  const labels: Record<GroupStatus, string> = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Tạm dừng",
    ARCHIVED: "Lưu trữ",
    DELETED: "Đã xóa",
  };

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
