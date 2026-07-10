import { useEffect, type ReactNode } from "react";
import {
  CalendarDays,
  FileWarning,
  Flag,
  Hash,
  MessageSquareText,
  UserRound,
  X,
} from "lucide-react";
import type { ReportResponse, ReportStatus } from "../../../../services/reportApi";
import { REPORT_UPDATE_STATUS_OPTIONS } from "../utils";
import {
  formatDateTime,
  getAdminNoteValue,
  getCreatedAtValue,
  getDefaultUpdateStatus,
  getDescriptionValue,
  getReasonLabel,
  getReasonValue,
  getReportDisplayId,
  getReporterDisplay,
  getReporterUserId,
  getStatusBadgeClass,
  getStatusLabel,
  getStatusValue,
  getTargetIdValue,
  getTargetTypeLabel,
  getTargetTypeValue,
  getUpdatedAtValue,
} from "../utils";

type AdminReportDetailModalProps = {
  open: boolean;
  report: ReportResponse | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  nextStatus: ReportStatus;
  adminNote: string;
  onClose: () => void;
  onStatusChange: (value: ReportStatus) => void;
  onAdminNoteChange: (value: string) => void;
  onSubmit: () => void;
};

export function AdminReportDetailModal({
  open,
  report,
  loading,
  error,
  updateLoading,
  nextStatus,
  adminNote,
  onClose,
  onStatusChange,
  onAdminNoteChange,
  onSubmit,
}: AdminReportDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !updateLoading) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, updateLoading]);

  if (!open) return null;

  const currentStatus = getStatusValue(report);
  const currentAdminNote = getAdminNoteValue(report);
  const reporterUserId = getReporterUserId(report);
  const targetId = getTargetIdValue(report);
  const createdAt = getCreatedAtValue(report);
  const updatedAt = getUpdatedAtValue(report);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết báo cáo"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={updateLoading ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-sand-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-amber-50 text-amber-600">
              <FileWarning size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-sand-900">
                Chi tiết báo cáo {getReportDisplayId(report)}
              </h3>
              {!loading && !error && report ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                      currentStatus,
                    )}`}
                  >
                    {getStatusLabel(currentStatus)}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs font-medium text-sand-700">
                    {getTargetTypeLabel(getTargetTypeValue(report))}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={updateLoading ? undefined : onClose}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
                {error}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-full rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
              >
                Đóng
              </button>
            </div>
          ) : !report ? (
            <div className="flex min-h-[320px] items-center justify-center text-center text-sm font-medium text-sand-500">
              Không có dữ liệu báo cáo.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Thông tin báo cáo
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={<Hash size={15} />}
                    label="Report ID"
                    value={getReportDisplayId(report)}
                  />
                  <InfoItem
                    icon={<UserRound size={15} />}
                    label="Reporter user id"
                    value={
                      reporterUserId === null ? "--" : `#${reporterUserId}`
                    }
                  />
                  <InfoItem
                    icon={<Flag size={15} />}
                    label="Target type"
                    value={getTargetTypeLabel(getTargetTypeValue(report))}
                  />
                  <InfoItem
                    icon={<Hash size={15} />}
                    label="Target id"
                    value={targetId === null ? "--" : `#${targetId}`}
                  />
                  <InfoItem
                    icon={<MessageSquareText size={15} />}
                    label="Lý do"
                    value={getReasonLabel(getReasonValue(report))}
                  />
                  <InfoItem
                    icon={<Flag size={15} />}
                    label="Trạng thái hiện tại"
                    value={getStatusLabel(currentStatus)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                    Người báo cáo
                  </p>
                  <p className="mt-2 text-sm font-medium text-sand-800">
                    {getReporterDisplay(report)}
                  </p>
                </div>

                <div className="rounded-lg border border-sand-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                    Admin note hiện tại
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-sand-800">
                    {currentAdminNote === "--"
                      ? "Chưa có ghi chú xử lý."
                      : currentAdminNote}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-sand-700">
                  {getDescriptionValue(report)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DateCard label="Created at" value={createdAt} />
                <DateCard label="Updated at" value={updatedAt} />
              </div>

              <div className="rounded-lg border border-sand-200 bg-white p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-sand-900">
                    Khu vực xử lý
                  </h4>
                  <p className="mt-0.5 text-xs font-medium text-sand-500">
                    Cập nhật trạng thái mới và ghi chú xử lý cho báo cáo này
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-sand-400">
                      Trạng thái mới
                    </span>
                    <select
                      value={nextStatus || getDefaultUpdateStatus(currentStatus)}
                      onChange={(event) =>
                        onStatusChange(event.target.value as ReportStatus)
                      }
                      disabled={updateLoading}
                      className="h-10 w-full rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-700 outline-none transition-colors focus:border-accent-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {REPORT_UPDATE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-sand-400">
                      Ghi chú xử lý
                    </span>
                    <textarea
                      value={adminNote}
                      onChange={(event) => onAdminNoteChange(event.target.value)}
                      placeholder="Nhập ghi chú xử lý..."
                      disabled={updateLoading}
                      rows={5}
                      className="w-full resize-none rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm text-sand-700 outline-none transition-colors focus:border-accent-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={updateLoading}
                      className="h-10 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={onSubmit}
                      disabled={updateLoading}
                      className="h-10 flex-1 rounded-lg bg-sand-900 px-3 text-sm font-medium text-white transition-all hover:bg-sand-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updateLoading ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
        <div className="h-3 w-28 rounded bg-sand-200" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-sand-200 bg-white px-3 py-2"
            >
              <div className="h-3 w-20 rounded bg-sand-100" />
              <div className="mt-2 h-4 w-28 rounded bg-sand-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-sand-200 bg-white p-3"
          >
            <div className="h-3 w-24 rounded bg-sand-100" />
            <div className="mt-3 h-4 w-40 rounded bg-sand-200" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
        <div className="h-3 w-24 rounded bg-sand-100" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full rounded bg-sand-200" />
          <div className="h-4 w-5/6 rounded bg-sand-200" />
          <div className="h-4 w-3/4 rounded bg-sand-200" />
        </div>
      </div>

      <div className="rounded-lg border border-sand-200 bg-white p-4">
        <div className="h-4 w-28 rounded bg-sand-200" />
        <div className="mt-4 h-10 w-full rounded bg-sand-100" />
        <div className="mt-4 h-28 w-full rounded bg-sand-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-10 flex-1 rounded bg-sand-100" />
          <div className="h-10 flex-1 rounded bg-sand-200" />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
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

function DateCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
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
