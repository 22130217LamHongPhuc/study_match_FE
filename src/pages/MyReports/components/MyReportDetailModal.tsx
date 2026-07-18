import { useEffect } from "react";
import { X } from "lucide-react";
import type { ReportResponse } from "../../../services/reportApi";
import {
  formatDateTime,
  getAdminNoteValue,
  getCreatedAtValue,
  getDescriptionValue,
  getMyReportStatusLabel,
  getReasonLabel,
  getReasonValue,
  getReportDisplayId,
  getStatusBadgeClass,
  getStatusValue,
  getTargetTypeBadgeClass,
  getTargetTypeLabel,
  getTargetTypeValue,
  getUpdatedAtValue,
} from "../utils";

type MyReportDetailModalProps = {
  open: boolean;
  report: ReportResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export function MyReportDetailModal({
  open,
  report,
  loading,
  error,
  onClose,
}: MyReportDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const targetType = getTargetTypeValue(report);
  const status = getStatusValue(report);
  const adminNote = getAdminNoteValue(report);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết báo cáo"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-800">
              Chi tiết báo cáo {getReportDisplayId(report)}
            </h3>
            {!loading && !error && report ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getTargetTypeBadgeClass(
                    targetType,
                  )}`}
                >
                  {getTargetTypeLabel(targetType)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                    status,
                  )}`}
                >
                  {getMyReportStatusLabel(status)}
                </span>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
                {error}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          ) : !report ? (
            <div className="flex min-h-[280px] items-center justify-center text-center text-sm font-medium text-gray-500">
              Không có dữ liệu báo cáo.
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-xl border border-gray-200 bg-blue-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Thông tin báo cáo
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Loại đối tượng"
                    value={getTargetTypeLabel(targetType)}
                  />
                  <InfoItem
                    label="Lý do"
                    value={getReasonLabel(getReasonValue(report))}
                  />
                  <InfoItem
                    label="Trạng thái"
                    value={getMyReportStatusLabel(status)}
                  />
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Mô tả đã gửi
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {getDescriptionValue(report)}
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Ghi chú admin
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {adminNote === "--"
                    ? "Chưa có ghi chú xử lý từ admin."
                    : adminNote}
                </p>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <DateCard label="Ngày gửi" value={getCreatedAtValue(report)} />
                <DateCard
                  label="Ngày cập nhật"
                  value={getUpdatedAtValue(report)}
                />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
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
      <div className="rounded-xl border border-gray-200 bg-blue-50/40 p-4">
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              <div className="h-3 w-20 rounded bg-gray-100" />
              <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="mt-3 h-4 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function DateCard({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </div>
      <p className="mt-3 text-sm font-medium text-gray-700">
        {formatDateTime(value)}
      </p>
    </div>
  );
}
