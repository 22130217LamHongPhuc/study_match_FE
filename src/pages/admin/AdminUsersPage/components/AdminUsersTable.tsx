import { useEffect, useState } from "react";

import { updateAdminUserStatus } from "../../../../services/UserService";
import {
  Eye,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlock,
} from "lucide-react";
import type { AdminUserDbRow, AdminUserStatus } from "../types";
import {
  formatDateTime,
  getBooleanBadgeClass,
  getRoleClassName,
  getRoleLabel,
  getStatusClassName,
  getStatusLabel,
} from "../utils";

type PendingUserStatusChange = {
  kind: "status" | "delete";
  userId: number;
  userName: string;
  fromStatus: AdminUserStatus;
  toStatus: AdminUserStatus;
};

type AdminUsersTableProps = {
  users: AdminUserDbRow[];
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onStatusUpdated?: (userId: number, status: AdminUserStatus) => void;
  onViewUser?: (userId: number) => void;
  onEditUser?: (userId: number) => void;
};

function statusLabel(status: AdminUserStatus) {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "INACTIVE":
      return "Bị khóa";
    case "DELETED":
      return "Đã xóa";
    default:
      return status;
  }
}

function ConfirmUserStatusChangePopup({
  open,
  pending,
  loading,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: PendingUserStatusChange | null;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || !pending) return null;

  const title = pending.kind === "delete" ? "Xác nhận xóa" : "Xác nhận";
  const content =
    pending.kind === "delete"
      ? `Bạn có chắc muốn xóa người dùng ${pending.userName}? Thao tác sẽ chuyển trạng thái sang ${statusLabel(
          pending.toStatus,
        )}.`
      : `Bạn có chắc muốn chuyển trạng thái người dùng ${pending.userName} từ ${statusLabel(
          pending.fromStatus,
        )} sang ${statusLabel(pending.toStatus)}?`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận đổi trạng thái người dùng"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Đóng"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-white p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-sand-900">{title}</h3>
        <p className="mt-1 text-sm font-medium text-sand-600">{content}</p>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-9 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-9 flex-1 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminUsersTable({
  users,
  page,
  totalPages,
  totalItems,
  pageSize,
  loading,
  onPageChange,
  onStatusUpdated,
  onViewUser,
  onEditUser,
}: AdminUsersTableProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] =
    useState<PendingUserStatusChange | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuUserId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuUserId(null);
    };

    const onMouseDown = () => {
      setOpenMenuUserId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [openMenuUserId]);

  const getUserDisplayName = (user: AdminUserDbRow) => {
    return user.full_name || user.email || `User #${user.user_id}`;
  };

  const canToggleStatus = (status: AdminUserStatus) => {
    return status === "ACTIVE" || status === "INACTIVE";
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingChange(null);
    setConfirmError(null);
  };

  const startToggleStatus = (user: AdminUserDbRow) => {
    const fromStatus = user.status as AdminUserStatus;

    if (!canToggleStatus(fromStatus)) return;

    const toStatus: AdminUserStatus =
      fromStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setPendingChange({
      kind: "status",
      userId: user.user_id,
      userName: getUserDisplayName(user),
      fromStatus,
      toStatus,
    });
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const startDeleteUser = (user: AdminUserDbRow) => {
    const fromStatus = user.status as AdminUserStatus;

    if (fromStatus === "DELETED") return;

    setPendingChange({
      kind: "delete",
      userId: user.user_id,
      userName: getUserDisplayName(user),
      fromStatus,
      toStatus: "DELETED",
    });

    setConfirmError(null);
    setConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;

    setConfirmLoading(true);
    setConfirmError(null);

    const res = await updateAdminUserStatus(
      pendingChange.userId,
      pendingChange.toStatus,
    );

    if (!res.success) {
      setConfirmLoading(false);
      setConfirmError(
        res.message || "Không thể cập nhật trạng thái người dùng",
      );
      return;
    }

    onStatusUpdated?.(pendingChange.userId, res.data.status);

    setConfirmLoading(false);
    setConfirmOpen(false);
    setPendingChange(null);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-sand-200 bg-white xl:col-span-2">
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50 text-left">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Người dùng
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Vai trò
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Email
              </th>

              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Đăng nhập gần nhất
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Cập nhật
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-sand-500">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index} className="border-b border-sand-100 last:border-b-0 animate-pulse">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-sand-200 rounded" />
                      <div className="h-3 w-48 bg-sand-100 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-16 bg-sand-200 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 bg-sand-200 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-40 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-sand-500"
                >
                  Không tìm thấy người dùng phù hợp bộ lọc hiện tại.
                </td>
              </tr>
            )}

            {!loading && users.map((user) => {
              const status = user.status as AdminUserStatus;
              const isDeleted = status === "DELETED";
              const toggleDisabled = !canToggleStatus(status);

              return (
                <tr
                  key={user.user_id}
                  className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-sand-800">
                      {user.full_name || "Chưa cập nhật tên"}
                    </p>
                    <p className="mt-0.5 text-xs text-sand-500">
                      ID: {user.user_id} • {user.email}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getRoleClassName(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getStatusClassName(user.status)}`}
                    >
                      {getStatusLabel(user.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getBooleanBadgeClass(user.email_verified)}`}
                    >
                      {user.email_verified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs font-medium text-sand-600">
                    {formatDateTime(user.last_login_at)}
                  </td>

                  <td className="px-4 py-3 text-xs font-medium text-sand-600">
                    {formatDateTime(user.updated_at)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewUser?.(user.user_id)}
                        className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                        aria-label="Xem chi tiết người dùng"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => startToggleStatus(user)}
                        disabled={toggleDisabled}
                        aria-disabled={toggleDisabled}
                        className={`rounded p-1.5 text-sand-400 transition-colors ${
                          toggleDisabled
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-sand-100 hover:text-sand-600"
                        }`}
                        aria-label={
                          status === "ACTIVE"
                            ? "Khóa người dùng"
                            : "Mở khóa người dùng"
                        }
                      >
                        {status === "ACTIVE" ? (
                          <Lock size={15} />
                        ) : (
                          <Unlock size={15} />
                        )}
                      </button>

                      <div
                        className="relative"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setOpenMenuUserId((prev) =>
                              prev === user.user_id ? null : user.user_id,
                            );
                          }}
                          disabled={isDeleted}
                          aria-disabled={isDeleted}
                          aria-haspopup="menu"
                          aria-expanded={openMenuUserId === user.user_id}
                          className={`rounded p-1.5 text-sand-400 transition-colors ${
                            isDeleted
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-sand-100 hover:text-sand-700"
                          }`}
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {openMenuUserId === user.user_id && !isDeleted && (
                          <div
                            role="menu"
                            className="absolute right-0 top-[calc(100%+6px)] z-10 w-44 overflow-hidden rounded-lg border border-sand-200 bg-white shadow-lg"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-sand-700 hover:bg-sand-50"
                              onClick={() => {
                                setOpenMenuUserId(null);
                                onEditUser?.(user.user_id);
                              }}
                            >
                              <Pencil size={14} className="text-sand-500" />
                              Chỉnh sửa
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setOpenMenuUserId(null);
                                startDeleteUser(user);
                              }}
                            >
                              <Trash2 size={14} className="text-rose-600" />
                              Xóa người dùng
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-sand-200 px-4 py-3">
        <p className="text-xs font-medium text-sand-500">
          Hiển thị{" "}
          <span className="font-medium text-sand-700">{startItem}</span> -{" "}
          <span className="font-medium text-sand-700">{endItem}</span> trong{" "}
          <span className="font-medium text-sand-700">{totalItems}</span> người
          dùng
        </p>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map(
            (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  disabled={totalPages === 0}
                  className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                    page === pageNumber
                      ? "bg-sand-900 text-white"
                      : "border border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {pageNumber}
                </button>
              );
            },
          )}
        </div>
      </div>

      <ConfirmUserStatusChangePopup
        open={confirmOpen}
        pending={pendingChange}
        loading={confirmLoading}
        error={confirmError}
        onCancel={closeConfirm}
        onConfirm={confirmStatusChange}
      />
    </section>
  );
}
