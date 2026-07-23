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
  role: AdminUserRole | "student" | "admin" | "super_admin",
): string {
  if (role === "student") return "Sinh viên";
  if (role === "admin") return "Quản trị viên";
  if (role === "super_admin") return "Super Admin";
  return "Tất cả vai trò";
}

export function getStatusLabel(status: string): string {
  const s = status?.toUpperCase();
  if (s === "ACTIVE") return "Hoạt động";
  if (s === "LOCKED") return "Bị khóa";
  if (s === "DELETED") return "Đã xóa";
  if (s === "PENDING") return "Chờ xác thực";
  if (s === "INACTIVE") return "Không hoạt động";
  if (s === "PENDING_ACTIVATION") return "Chờ kích hoạt";
  return status || "Chưa xác định";
}

export function getStatusClassName(status: string): string {
  const s = status?.toUpperCase();
  if (s === "ACTIVE") {
    return "border-sage-100 bg-sage-50 text-sage-700";
  }
  if (s === "LOCKED") {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }
  if (s === "PENDING") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }
  if (s === "INACTIVE") {
    return "border-sand-200 bg-sand-50 text-sand-600";
  }
  if (s === "PENDING_ACTIVATION") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-rose-100 bg-rose-50 text-rose-700";
}

export function getRoleClassName(role: "student" | "admin" | "super_admin"): string {
  if (role === "super_admin") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
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
