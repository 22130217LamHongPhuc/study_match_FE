import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Filter,
  Globe2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Lock,
  UsersRound,
  Unlock,
} from "lucide-react";
import type { GroupRow } from "../types";
import { GroupStatusBadge, GroupTypeBadge } from "./GroupBadges";
import { Pagination } from "../../../../components/admin/Pagination";
import { AdminGroupDetailSheet } from "./AdminGroupDetailSheet";
import {
  AdminGroupStatus,
  updateAdminGroupStatus,
} from "../../../../services/GroupService";

type PendingStatusChange = {
  kind: "status" | "delete";
  groupId: number;
  groupName: string;
  fromStatus: AdminGroupStatus;
  toStatus: AdminGroupStatus;
};

function statusLabel(status: AdminGroupStatus) {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "INACTIVE":
      return "Bị khóa";
    case "ARCHIVED":
      return "Lưu trữ";
    case "DELETED":
      return "Đã xóa";
    default:
      return status;
  }
}

function ConfirmStatusChangePopup({
  open,
  pending,
  loading,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: PendingStatusChange | null;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open || !pending) return null;

  const title = pending.kind === "delete" ? "Xác nhận xóa" : "Xác nhận";
  const content =
    pending.kind === "delete"
      ? `Bạn có chắc muốn xóa nhóm ${pending.groupName}? Thao tác sẽ chuyển trạng thái sang ${statusLabel(
          pending.toStatus,
        )}.`
      : `Bạn có chắc muốn chuyển trạng thái nhóm ${pending.groupName} từ ${statusLabel(
          pending.fromStatus,
        )} sang ${statusLabel(pending.toStatus)}?`;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận đổi trạng thái nhóm"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-[13px] font-medium text-gray-600">{content}</p>

        {error && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-8 flex-1 rounded border border-gray-300 bg-white px-3 text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-8 flex-1 rounded bg-gray-900 px-3 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang cập nhật..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminGroupsTable({
  groups,
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  onPageChange,
  onStatusUpdated,
  onEditGroup,
}: {
  groups: GroupRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onStatusUpdated?: (groupId: number, status: AdminGroupStatus) => void;
  onEditGroup?: (groupId: number) => void;
}) {
  const formattedRows = useMemo(() => {
    return groups.map((g) => ({
      ...g,
      createdAtText: new Date(g.createdAt).toLocaleString("vi-VN"),
    }));
  }, [groups]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [openMenuGroupId, setOpenMenuGroupId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuGroupId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuGroupId(null);
    };

    const onMouseDown = () => {
      setOpenMenuGroupId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [openMenuGroupId]);

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingChange(null);
    setConfirmError(null);
  };

  const startToggleStatus = (group: GroupRow) => {
    if (group.status === "DELETED") return;

    const fromStatus = group.status as AdminGroupStatus;
    if (fromStatus !== "ACTIVE" && fromStatus !== "INACTIVE") return;

    const toStatus: AdminGroupStatus =
      fromStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setPendingChange({
      kind: "status",
      groupId: group.id,
      groupName: group.name,
      fromStatus,
      toStatus,
    });
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const startDeleteGroup = (group: GroupRow) => {
    if (group.status === "DELETED") return;

    setPendingChange({
      kind: "delete",
      groupId: group.id,
      groupName: group.name,
      fromStatus: group.status as AdminGroupStatus,
      toStatus: "DELETED",
    });
    setConfirmError(null);
    setConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!pendingChange) return;

    setConfirmLoading(true);
    setConfirmError(null);

    const res = await updateAdminGroupStatus(
      pendingChange.groupId,
      pendingChange.toStatus,
    );

    if (!res.success) {
      setConfirmLoading(false);
      setConfirmError(res.message || "Không thể cập nhật trạng thái nhóm");
      return;
    }

    onStatusUpdated?.(pendingChange.groupId, res.data.status);

    setConfirmLoading(false);
    setConfirmOpen(false);
    setPendingChange(null);
  };

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Danh sách nhóm học
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-gray-400">
            Theo dõi nhóm cộng đồng và nhóm học riêng của sinh viên
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
          <Filter size={13} />
          Bộ lọc
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Tên nhóm
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Loại
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Môn học
              </th>

              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {formattedRows.map((group) => (
              <tr
                key={group.id}
                className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                        group.type === "COMMUNITY"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {group.type === "COMMUNITY" ? (
                        <Globe2 size={15} />
                      ) : (
                        <UsersRound size={15} />
                      )}
                    </div>

                    <div>
                      <p className="text-[13px] font-bold text-gray-800">
                        {group.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <GroupTypeBadge type={group.type} />
                </td>

                <td className="px-4 py-3">
                  <span className="text-[12px] font-semibold text-gray-700">
                    {group.subjectName}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <GroupStatusBadge status={group.status} />
                </td>

                <td className="px-4 py-3">
                  <span className="text-[12px] font-medium text-gray-500">
                    {group.createdAtText}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setDetailOpen(true);
                      }}
                      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      aria-label="Xem chi tiết nhóm"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startToggleStatus(group)}
                      disabled={
                        group.status === "DELETED" ||
                        (group.status !== "ACTIVE" &&
                          group.status !== "INACTIVE")
                      }
                      aria-disabled={
                        group.status === "DELETED" ||
                        (group.status !== "ACTIVE" &&
                          group.status !== "INACTIVE")
                      }
                      className={`rounded p-1.5 text-gray-400 transition-colors ${
                        group.status === "DELETED" ||
                        (group.status !== "ACTIVE" &&
                          group.status !== "INACTIVE")
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-gray-100 hover:text-orange-600"
                      }`}
                      aria-label={
                        group.status === "ACTIVE" ? "Khóa nhóm" : "Mở khóa nhóm"
                      }
                    >
                      {group.status === "ACTIVE" ? (
                        <Lock size={15} />
                      ) : group.status === "INACTIVE" ? (
                        <Unlock size={15} />
                      ) : (
                        <Lock size={15} />
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
                          setOpenMenuGroupId((prev) =>
                            prev === group.id ? null : group.id,
                          );
                        }}
                        disabled={group.status === "DELETED"}
                        aria-disabled={group.status === "DELETED"}
                        aria-haspopup="menu"
                        aria-expanded={openMenuGroupId === group.id}
                        className={`rounded p-1.5 text-gray-400 transition-colors ${
                          group.status === "DELETED"
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {openMenuGroupId === group.id &&
                        group.status !== "DELETED" && (
                          <div
                            role="menu"
                            className="absolute right-0 top-[calc(100%+6px)] z-10 w-44 overflow-hidden rounded border border-gray-200 bg-white shadow"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setOpenMenuGroupId(null);
                                if (onEditGroup) {
                                  onEditGroup(group.id);
                                  return;
                                }

                                setSelectedGroupId(group.id);
                                setDetailOpen(true);
                              }}
                            >
                              <Pencil size={14} className="text-gray-500" />
                              Chỉnh sửa
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setOpenMenuGroupId(null);
                                startDeleteGroup(group);
                              }}
                            >
                              <Trash2 size={14} className="text-red-600" />
                              Xóa nhóm
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && formattedRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[13px] font-medium text-gray-400"
                >
                  Không có nhóm học nào.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[13px] font-medium text-gray-400"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />

      <AdminGroupDetailSheet
        open={detailOpen}
        groupId={selectedGroupId}
        onClose={() => setDetailOpen(false)}
      />

      <ConfirmStatusChangePopup
        open={confirmOpen}
        pending={pendingChange}
        loading={confirmLoading}
        error={confirmError}
        onCancel={closeConfirm}
        onConfirm={confirmToggleStatus}
      />
    </div>
  );
}
