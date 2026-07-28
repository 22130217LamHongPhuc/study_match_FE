import { useEffect } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  UserRound,
  Users2,
  Video,
  X,
} from "lucide-react";
import type { ScheduleRow } from "../types";
import {
  ScheduleStatusBadge,
  ScheduleTypeBadge,
  StudyModeBadge,
} from "./ScheduleBadges";
import { createPortal } from "react-dom";

type ScheduleDetailModalProps = {
  open: boolean;
  schedule: ScheduleRow | null;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScheduleDetailModal({
  open,
  schedule,
  onClose,
}: ScheduleDetailModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết lịch học"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-sand-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-accent-50 text-accent-600">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-sand-900">
                {schedule?.sessionName ?? "—"}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {schedule && (
                  <>
                    <ScheduleStatusBadge status={schedule.status} />
                    <ScheduleTypeBadge type={schedule.scheduleType} />
                    <StudyModeBadge mode={schedule.studyMode} />
                  </>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!schedule ? (
            <div className="flex min-h-[300px] items-center justify-center text-center text-sm font-medium text-sand-500">
              Không có dữ liệu lịch học.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Basic info */}
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Thông tin buổi học
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={<BookOpen size={15} />}
                    label="Môn học"
                    value={schedule.subject ?? "—"}
                  />
                  <InfoItem
                    icon={<Users2 size={15} />}
                    label="Nhóm học"
                    value={schedule.groupName ?? "Không có nhóm"}
                  />
                  <InfoItem
                    icon={<UserRound size={15} />}
                    label="Người tạo"
                    value={schedule.creatorName}
                  />
                  <InfoItem
                    icon={<Users2 size={15} />}
                    label="Số thành viên"
                    value={`${schedule.memberCount}/${schedule.maxMembers}`}
                  />
                </div>
              </div>

              {/* Time */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sand-400">
                    <Clock size={15} />
                    <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                      Thời gian bắt đầu
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-sand-800">
                    {formatDateTime(schedule.startTime)}
                  </p>
                </div>

                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sand-400">
                    <Clock size={15} />
                    <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                      Thời gian kết thúc
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-sand-800">
                    {formatDateTime(schedule.endTime)}
                  </p>
                </div>
              </div>

              {/* Location / Link */}
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Địa điểm / Link
                </p>

                <div className="mt-3 space-y-2">
                  {schedule.location && (
                    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-sand-400"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-sand-500">
                          Địa điểm
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-sand-800">
                          {schedule.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {schedule.onlineLink && (
                    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2">
                      <Video
                        size={15}
                        className="mt-0.5 shrink-0 text-sand-400"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-sand-500">
                          Link online
                        </p>
                        <a
                          href={schedule.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-accent-600 hover:underline"
                        >
                          {schedule.onlineLink}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}

                  {!schedule.location && !schedule.onlineLink && (
                    <p className="text-sm font-medium text-sand-400">
                      Chưa có thông tin địa điểm hoặc link online.
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Mô tả
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-sand-700">
                  {schedule.description?.trim() || "—"}
                </p>
              </div>

              {/* Members */}
              <div className="rounded-lg border border-sand-200 bg-white p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Danh sách thành viên ({schedule.members.length})
                </p>

                {schedule.members.length === 0 ? (
                  <p className="mt-2 text-sm font-medium text-sand-400">
                    Chưa có thành viên.
                  </p>
                ) : (
                  <div className="mt-3 space-y-1.5">
                    {schedule.members.map((m) => (
                      <div
                        key={m.userId}
                        className="flex items-center gap-2 rounded-lg border border-sand-100 px-3 py-2"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-200 text-[9px] font-medium text-sand-600">
                          {m.fullName
                            .split(" ")
                            .map((w) => w[0])
                            .slice(-2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-sand-700">
                          {m.fullName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close button */}
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
    document.body
  );
}

// ── Reusable info item (same as AdminUserDetailModal) ───────────
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
