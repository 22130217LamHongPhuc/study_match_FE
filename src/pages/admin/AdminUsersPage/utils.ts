import type { AdminUserRole, AdminUserStatus } from "./types";

export function formatDateTime(value: string | null): string {
  if (!value) return "Chưa đăng nhập";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getRoleLabel(
  role: AdminUserRole | "student" | "admin",
): string {
  if (role === "student") return "Sinh viên";
  if (role === "admin") return "Quản trị viên";
  return "Tất cả vai trò";
}

export function getStatusLabel(status: AdminUserStatus): string {
  if (status === "ACTIVE") return "Hoạt động";
  if (status === "INACTIVE") return "Không hoạt động";
  if (status === "SUSPENDED") return "Tạm khóa";
  if (status === "DELETED") return "Đã xóa";
  return "Tất cả trạng thái";
}

export function getStatusClassName(status: AdminUserStatus): string {
  if (status === "ACTIVE") {
    return "border-sage-100 bg-sage-50 text-sage-700";
  }
  if (status === "INACTIVE") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-rose-100 bg-rose-50 text-rose-700";
}

export function getRoleClassName(role: "student" | "admin"): string {
  if (role === "admin") {
    return "border-accent-100 bg-accent-50 text-accent-700";
  }
  return "border-sand-200 bg-sand-100 text-sand-700";
}

export function getBooleanBadgeClass(value: boolean): string {
  if (value) {
    return "border-sage-100 bg-sage-50 text-sage-700";
  }
  return "border-sand-200 bg-sand-100 text-sand-600";
}
