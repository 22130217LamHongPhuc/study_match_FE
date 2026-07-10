import { Eye, FileWarning } from "lucide-react";
import type { ReportResponse } from "../../../../services/reportApi";
import {
  getCreatedAtValue,
  formatDateTime,
  getReasonLabel,
  getReasonValue,
  getReportDisplayId,
  getReportNumericId,
  getReporterDisplay,
  getReporterUserId,
  getStatusBadgeClass,
  getStatusLabel,
  getStatusValue,
  getTargetIdValue,
  getTargetTypeBadgeClass,
  getTargetTypeLabel,
  getTargetTypeValue,
} from "../utils";

type AdminReportsTableProps = {
  reports: ReportResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (reportId: number) => void;
};

export function AdminReportsTable({
  reports,
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  onPageChange,
  onViewDetail,
}: AdminReportsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-medium text-sand-800">
            Danh sách báo cáo
          </h3>
          <p className="mt-0.5 text-xs font-medium text-sand-500">
            Theo dõi và xử lý các báo cáo vi phạm được gửi từ người dùng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50 text-left">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Report ID
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Người báo cáo
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Loại đối tượng
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                ID đối tượng
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Lý do
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Thời gian gửi
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-sand-500">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: pageSize }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-sand-100 last:border-b-0 animate-pulse"
                >
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 rounded bg-sand-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-28 rounded bg-sand-200" />
                      <div className="h-3 w-20 rounded bg-sand-100" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-20 rounded-full bg-sand-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 rounded bg-sand-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-28 rounded-full bg-sand-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-24 rounded-full bg-sand-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="h-4 w-24 rounded bg-sand-200" />
                      <div className="h-3 w-20 rounded bg-sand-100" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-8 w-24 rounded-lg bg-sand-100" />
                  </td>
                </tr>
              ))}

            {!loading &&
              reports.map((report, index) => {
                const reportId = getReportNumericId(report);
                const reporterUserId = getReporterUserId(report);
                const targetType = getTargetTypeValue(report);
                const targetId = getTargetIdValue(report);
                const reason = getReasonValue(report);
                const status = getStatusValue(report);

                return (
                  <tr
                    key={reportId ?? `report-row-${index}`}
                    className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-sand-800">
                        {getReportDisplayId(report)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-sand-800">
                        {getReporterDisplay(report)}
                      </p>
                      <p className="mt-0.5 text-xs text-sand-500">
                        {reporterUserId === null
                          ? "ID: --"
                          : `ID: ${reporterUserId}`}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getTargetTypeBadgeClass(
                          targetType,
                        )}`}
                      >
                        {getTargetTypeLabel(targetType)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-sand-700">
                      {targetId === null ? "--" : `#${targetId}`}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md border border-sand-200 bg-sand-50 px-2 py-1 text-xs font-medium text-sand-700">
                        {getReasonLabel(reason)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                          status,
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs font-medium text-sand-600">
                      {formatDateTime(getCreatedAtValue(report))}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (reportId !== null) {
                              onViewDetail(reportId);
                            }
                          }}
                          disabled={reportId === null}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-sand-300 bg-white px-3 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Eye size={14} />
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading && reports.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                      <FileWarning size={22} className="text-sand-400" />
                    </div>
                    <p className="text-sm font-medium text-sand-600">
                      Không có báo cáo nào
                    </p>
                    <p className="text-xs text-sand-400">
                      Thử thay đổi bộ lọc để tìm thêm báo cáo phù hợp.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReportsPagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

function ReportsPagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);
  const pageCount = Math.max(totalPages, 1);

  return (
    <div className="flex items-center justify-between border-t border-sand-200 px-4 py-3">
      <p className="text-xs font-medium text-sand-500">
        Hiển thị <span className="font-medium text-sand-700">{startItem}</span>{" "}
        - <span className="font-medium text-sand-700">{endItem}</span> trong{" "}
        <span className="font-medium text-sand-700">{totalItems}</span> báo cáo
      </p>

      <div className="flex items-center gap-1">
        {Array.from({ length: pageCount }).map((_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={totalItems === 0}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                page === pageNumber
                  ? "bg-sand-900 text-white"
                  : "border border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
