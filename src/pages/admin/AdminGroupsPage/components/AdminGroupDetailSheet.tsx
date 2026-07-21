import { useEffect, useMemo, useState } from "react";
import { Globe2, UsersRound, X, Crown, Trash2 } from "lucide-react";
import { GroupStatusBadge, GroupTypeBadge } from "./GroupBadges";
import {
  AdminGroupDetailResponse,
  getAdminGroupDetail,
  removeAdminGroupMember,
  changeAdminGroupOwner,
} from "../../../../services/GroupService";
import { LoadingSkeleton } from "../../../../components/modal/basic/LoadingSkeleton";
import { normalizeAvatarUrl } from "../../../../services/FriendService";

export function AdminGroupDetailSheet({
  open,
  groupId,
  onClose,
}: {
  open: boolean;
  groupId: number | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminGroupDetailResponse | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "remove" | "owner" | null;
    userId: number | null;
    fullName: string;
  }>({ open: false, type: null, userId: null, fullName: "" });
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    const res = await getAdminGroupDetail(groupId);
    if (!res.success) {
      setDetail(null);
      setError(res.message || "Không thể tải chi tiết nhóm");
    } else {
      setDetail(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && groupId) {
      load();
    }
  }, [open, groupId]);

  const triggerRemoveMember = (userId: number, fullName: string) => {
    setActionError(null);
    setConfirmModal({ open: true, type: "remove", userId, fullName });
  };

  const triggerChangeOwner = (userId: number, fullName: string) => {
    setActionError(null);
    setConfirmModal({ open: true, type: "owner", userId, fullName });
  };

  const handleConfirmAction = async () => {
    if (!groupId || !confirmModal.userId || !confirmModal.type) return;

    setActionLoading(true);
    setActionError(null);

    try {
      let res;
      if (confirmModal.type === "remove") {
        res = await removeAdminGroupMember(groupId, confirmModal.userId);
      } else {
        res = await changeAdminGroupOwner(groupId, confirmModal.userId);
      }

      if (res.success) {
        setConfirmModal({ open: false, type: null, userId: null, fullName: "" });
        await load();
      } else {
        setActionError(res.message || (confirmModal.type === "remove" ? "Xóa thành viên thất bại" : "Chuyển quyền trưởng nhóm thất bại"));
      }
    } catch (err: any) {
      setActionError(err?.message || "Đã xảy ra lỗi hệ thống");
    } finally {
      setActionLoading(false);
    }
  };

  const freeTimeSlots = useMemo(() => {
    const slots = detail?.freeTimeSlots || [];
    return slots.filter((s) => s.isAvailable !== false);
  }, [detail]);

  if (!open) return null;

  const headerType = detail?.groupType;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết nhóm"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 flex max-h-[90vh] min-h-[420px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        {loading ? (
          <div className="flex min-h-[420px] flex-1 flex-col">
            {/* <LoadingSkeleton /> */}
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between border-b border-sand-200 px-4 py-3">
              <div className="flex items-start gap-3">
                {detail?.avatarUrl ? (
                  <img
                    src={normalizeAvatarUrl(detail.avatarUrl) || ""}
                    alt={detail.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover border border-sand-200"
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      headerType === "COMMUNITY"
                        ? "bg-accent-50 text-accent-600"
                        : "bg-sand-100 text-sand-600"
                    }`}
                  >
                    {headerType === "COMMUNITY" ? (
                      <Globe2 size={18} />
                    ) : (
                      <UsersRound size={18} />
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-sand-900">
                    {detail?.name || "Chi tiết nhóm"}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {detail?.groupType && (
                      <GroupTypeBadge type={detail.groupType} />
                    )}

                    {detail?.status && (
                      <GroupStatusBadge status={detail.status} />
                    )}

                    {detail?.visibility && (
                      <span className="inline-flex items-center rounded-md bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-700">
                        {detail.visibility}
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
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {!error && detail && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                      Mô tả
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-sand-700">
                      {detail.description?.trim() ? detail.description : "--"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                        Môn học
                      </p>
                      <p className="mt-1 text-sm font-medium text-sand-800">
                        {formatMaybe(detail.subjectName)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                        Số thành viên
                      </p>
                      <p className="mt-1 text-sm font-medium text-sand-800">
                        {formatMaybe(detail.memberCount)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                        Tối đa
                      </p>
                      <p className="mt-1 text-sm font-medium text-sand-800">
                        {detail.maxMembers === null ||
                        detail.maxMembers === undefined
                          ? "--"
                          : detail.maxMembers}
                      </p>
                    </div>

                    <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                        Ngày tạo
                      </p>
                      <p className="mt-1 text-sm font-medium text-sand-800">
                        {new Date(detail.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="rounded-lg border border-sand-200 bg-sand-50 p-3 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                        Cập nhật
                      </p>
                      <p className="mt-1 text-sm font-medium text-sand-800">
                        {new Date(detail.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-medium text-sand-800">
                          Khung giờ rảnh
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-sand-500">
                          Danh sách có thể trống đối với nhóm cộng đồng
                        </p>
                      </div>
                    </div>

                    {freeTimeSlots.length === 0 ? (
                      <div className="mt-2 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-xs font-medium text-sand-500">
                        Không có khung giờ rảnh.
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {freeTimeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="rounded-md border border-sand-200 bg-sand-50 px-2 py-1"
                          >
                            <span className="text-xs font-medium text-sand-700">
                              {(dayOfWeekLabels[slot.dayOfWeek] ||
                                `Ngày ${slot.dayOfWeek}`) +
                                " - " +
                                formatSlotCode(slot.slotCode)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-sand-800">
                      Thành viên nhóm ({detail.members?.length || 0})
                    </p>

                    {!detail.members || detail.members.length === 0 ? (
                      <div className="mt-2 rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-xs font-medium text-sand-500">
                        Không có thành viên nào.
                      </div>
                    ) : (
                      <div className="mt-2 divide-y divide-sand-100 rounded-lg border border-sand-200 bg-white max-h-[220px] overflow-y-auto">
                        {detail.members.map((member) => {
                          const initials = member.fullName
                            ? member.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "U";
                          return (
                            <div
                              key={member.userId}
                              className="flex items-center justify-between p-2.5 hover:bg-sand-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {member.avatarUrl ? (
                                  <img
                                    src={normalizeAvatarUrl(member.avatarUrl) || ""}
                                    alt={member.fullName}
                                    className="h-8 w-8 rounded-full object-cover border border-sand-100 shrink-0"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-200 text-[10px] font-bold text-sand-600">
                                    {initials}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-sand-800 truncate">
                                    {member.fullName}
                                  </p>
                                  <p className="text-[10px] text-sand-500 truncate mt-0.5">
                                    {member.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 pl-2">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                                    member.role === "OWNER"
                                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                                      : member.role === "ADMIN"
                                        ? "bg-blue-50 border border-blue-200 text-blue-700"
                                        : "bg-sand-50 border border-sand-200 text-sand-600"
                                  }`}
                                >
                                  {member.role === "OWNER"
                                    ? "Trưởng nhóm"
                                    : member.role === "ADMIN"
                                      ? "Phó nhóm"
                                      : "Thành viên"}
                                </span>

                                <span className="text-[10px] text-sand-400">
                                  {member.joinedAt
                                    ? new Date(member.joinedAt).toLocaleDateString("vi-VN")
                                    : ""}
                                </span>

                                {member.role !== "OWNER" && (
                                  <div className="flex items-center gap-1 ml-1 border-l border-sand-200 pl-1.5">
                                    <button
                                      type="button"
                                      onClick={() => triggerChangeOwner(member.userId, member.fullName)}
                                      disabled={actionLoading}
                                      title="Chuyển quyền trưởng nhóm"
                                      className="rounded p-0.5 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                                    >
                                      <Crown size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => triggerRemoveMember(member.userId, member.fullName)}
                                      disabled={actionLoading}
                                      title="Xóa khỏi nhóm"
                                      className="rounded p-0.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

              {!error && !detail && (
                <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-medium text-sand-500">
                  Không có dữ liệu.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {confirmModal.open && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              if (!actionLoading) {
                setConfirmModal({ open: false, type: null, userId: null, fullName: "" });
              }
            }}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-sand-200 bg-white p-4 shadow-xl animate-scale-in">
            <h4 className="text-sm font-semibold text-sand-900">
              {confirmModal.type === "remove" ? "Xác nhận xóa thành viên" : "Xác nhận chuyển quyền trưởng nhóm"}
            </h4>
            <p className="mt-2 text-xs font-medium text-sand-600 leading-relaxed">
              {confirmModal.type === "remove"
                ? `Bạn có chắc chắn muốn xóa thành viên "${confirmModal.fullName}" ra khỏi nhóm học này không? Hành động này sẽ hủy quyền tham gia của họ.`
                : `Bạn có chắc chắn muốn chuyển quyền trưởng nhóm cho "${confirmModal.fullName}" không? Bạn sẽ không thể hoàn tác hành động này.`}
            </p>

            {actionError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmModal({ open: false, type: null, userId: null, fullName: "" })}
                className="h-9 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-xs font-semibold text-sand-700 transition-all hover:bg-sand-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className={`h-9 flex-1 rounded-lg px-3 text-xs font-semibold text-white transition-all disabled:opacity-50 ${
                  confirmModal.type === "remove"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {actionLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMaybe(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}

function formatSlotCode(slotCode: string) {
  const normalized = slotCode.trim();
  if (normalized.length === 0) return "--";

  const lower = normalized.toLowerCase();
  if (!lower.startsWith("ca")) return normalized;

  const numberPart = normalized.slice(2).trim();
  if (numberPart.length === 0) return normalized;

  for (const ch of numberPart) {
    if (ch < "0" || ch > "9") return normalized;
  }

  const caNumber = Number.parseInt(numberPart, 10);
  if (Number.isNaN(caNumber)) return normalized;

  return `Ca ${caNumber}`;
}

const dayOfWeekLabels: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};
