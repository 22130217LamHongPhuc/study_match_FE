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
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative z-10 flex max-h-[90vh] min-h-[420px] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        {loading ? (
          <div className="flex min-h-[420px] flex-1 flex-col">
            {/* <LoadingSkeleton /> */}
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${
                    headerType === "COMMUNITY"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {headerType === "COMMUNITY" ? (
                    <Globe2 size={16} />
                  ) : (
                    <UsersRound size={16} />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800">
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
                      <span className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                        {detail.visibility}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Đóng modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!error && detail && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Mô tả
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[13px] font-medium text-gray-700">
                      {detail.description?.trim() ? detail.description : "--"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded border border-gray-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Môn học
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-800">
                        {formatMaybe(detail.subjectName)}
                      </p>
                    </div>

                    <div className="rounded border border-gray-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Số thành viên
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-800">
                        {formatMaybe(detail.memberCount)}
                      </p>
                    </div>

                    <div className="rounded border border-gray-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Tối đa
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-800">
                        {detail.maxMembers === null ||
                        detail.maxMembers === undefined
                          ? "--"
                          : detail.maxMembers}
                      </p>
                    </div>

                    <div className="rounded border border-gray-200 bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Ngày tạo
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-800">
                        {new Date(detail.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="rounded border border-gray-200 bg-white p-3 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Cập nhật
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-gray-800">
                        {new Date(detail.updatedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Khung giờ rảnh
                        </p>
                        <p className="mt-0.5 text-[12px] font-medium text-gray-400">
                          Danh sách có thể trống đối với nhóm cộng đồng
                        </p>
                      </div>
                    </div>

                    {freeTimeSlots.length === 0 ? (
                      <div className="mt-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-medium text-gray-500">
                        Không có khung giờ rảnh.
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {freeTimeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="rounded border border-gray-200 bg-gray-50 px-2 py-1"
                          >
                            <span className="text-[12px] font-semibold text-gray-800">
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
                      className="h-8 w-full rounded border border-gray-300 bg-white px-3 text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              {!error && !detail && (
                <div className="flex min-h-[300px] items-center justify-center text-center text-[13px] font-medium text-gray-400">
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
