import { useEffect, useState } from "react";

import { createPortal } from "react-dom";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import type { AdminUserDbRow } from "../types";
import { normalizeAvatarUrl } from "../../../../services/FriendService";
import {
  formatDateTime,
  getBooleanBadgeClass,
  getRoleClassName,
  getRoleLabel,
  getStatusClassName,
  getStatusLabel,
} from "../utils";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

type AdminUserDetailModalProps = {
  open: boolean;
  user: AdminUserDbRow | null;
  onClose: () => void;
};

export function AdminUserDetailModal({
  open,
  user,
  onClose,
}: AdminUserDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const displayName = user?.full_name || "Chưa cập nhật tên";
  const email = user?.email || "--";

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết người dùng"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 flex max-h-[90vh] min-h-[420px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-sand-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-accent-50 text-accent-600">
              {user?.avatar_url ? (
                <img
                  src={normalizeAvatarUrl(user.avatar_url) || DEFAULT_AVATAR}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
              ) : (
                <UserRound size={18} />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-sand-900">
                {displayName}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {user?.role ? (
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getRoleClassName(
                      user.role,
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-500">
                    Chưa có vai trò
                  </span>
                )}

                {user?.status ? (
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                      user.status,
                    )}`}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-500">
                    Chưa có trạng thái
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!user ? (
            <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-medium text-sand-500">
              Không có dữ liệu người dùng.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Thông tin cơ bản
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={<UserRound size={15} />}
                    label="Mã người dùng"
                    value={`#${user.user_id}`}
                  />

                  <InfoItem
                    icon={<Mail size={15} />}
                    label="Email"
                    value={email}
                  />

                  <InfoItem
                    icon={<Shield size={15} />}
                    label="Vai trò"
                    value={user.role ? getRoleLabel(user.role) : "--"}
                  />

                  <InfoItem
                    icon={<CheckCircle2 size={15} />}
                    label="Trạng thái"
                    value={user.status ? getStatusLabel(user.status) : "--"}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                    Xác thực email
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getBooleanBadgeClass(
                      user.email_verified,
                    )}`}
                  >
                    {user.email_verified ? "Đã xác thực" : "Chưa xác thực"}
                  </span>
                </div>

                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                    Onboarding
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getBooleanBadgeClass(
                      user.is_onboarding_completed,
                    )}`}
                  >
                    {user.is_onboarding_completed
                      ? "Đã hoàn tất"
                      : "Chưa hoàn tất"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Tiểu sử
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-sand-700">
                  {user.bio?.trim() ? user.bio : "--"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DateCard label="Ngày tạo" value={user.created_at} />
                <DateCard label="Cập nhật" value={user.updated_at} />
                <DateCard
                  label="Đăng nhập gần nhất"
                  value={user.last_login_at}
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 w-full rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2">
      <div className="mt-0.5 text-sand-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-sand-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function DateCard({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sand-400">
        <CalendarDays size={15} />
        <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-medium text-sand-800">
        {formatDateTime(value)}
      </p>
    </div>
  );
}
