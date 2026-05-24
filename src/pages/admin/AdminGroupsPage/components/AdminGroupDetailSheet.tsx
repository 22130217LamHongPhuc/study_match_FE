import { useEffect, useMemo, useState } from "react";
import { Globe2, UsersRound, X } from "lucide-react";
import { GroupStatusBadge, GroupTypeBadge } from "./GroupBadges";
import {
  AdminGroupDetailResponse,
  getAdminGroupDetail,
} from "../../../../services/GroupService";
import { LoadingSkeleton } from "../../../../components/modal/basic/LoadingSkeleton";

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

  useEffect(() => {
    if (!open || !groupId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setDetail(null);

      const res = await getAdminGroupDetail(groupId);

      if (cancelled) return;

      if (!res.success) {
        setDetail(null);
        setError(res.message || "Không thể tải chi tiết nhóm");
        setLoading(false);
        return;
      }

      setDetail(res.data);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, groupId]);

  const freeTimeSlots = useMemo(() => {
    const slots = detail?.freeTimeSlots || [];
    return slots.filter((s) => s.isAvailable !== false);
  }, [detail]);

  if (!open) return null;

  const headerType = detail?.groupType;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
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
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${
                    headerType === "COMMUNITY"
                      ? "bg-accent-50 text-accent-600"
                      : "bg-sand-100 text-sand-600"
                  }`}
                >
                  {headerType === "COMMUNITY" ? (
                    <Globe2 size={16} />
                  ) : (
                    <UsersRound size={16} />
                  )}
                </div>

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
