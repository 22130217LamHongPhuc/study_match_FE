import { Eye, FileWarning } from "lucide-react";
import noImg from "../../../assets/img/no-img.png";
import type { ReportResponse } from "../../../services/reportApi";
import {
  formatDateTime,
  getCreatedAtValue,
  getMyReportStatusLabel,
  getReasonLabel,
  getReasonValue,
  getReportNumericId,
  getStatusBadgeClass,
  getStatusValue,
  getTargetIdValue,
  getTargetTypeBadgeClass,
  getTargetTypeLabel,
  getTargetTypeValue,
} from "../utils";

type MyReportsTableProps = {
  reports: ReportResponse[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onViewDetail: (reportId: number) => void;
};

export function MyReportsTable({
  reports,
  page,
  pageSize,
  totalItems,
  totalPages,
  loading,
  onPageChange,
  onViewDetail,
}: MyReportsTableProps) {
  const hasReports = reports.length > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Danh sách báo cáo</h2>
        <p className="mt-1 text-sm text-gray-500">
          Theo dõi tiến độ xử lý những báo cáo bạn đã gửi tới admin
        </p>
      </div>

      {loading ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[880px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-blue-50/60 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Loại đối tượng
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID đối tượng
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Lý do
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ngày gửi
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: pageSize }).map((_, index) => (
                  <tr
                    key={index}
                    className="animate-pulse border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="h-6 w-24 rounded-full bg-gray-200" />
                    </td>
                    {/* <td className="px-5 py-4">
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </td> */}
                    <td className="px-5 py-4">
                      <div className="h-6 w-28 rounded-full bg-gray-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-6 w-28 rounded-full bg-gray-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="h-4 w-28 rounded bg-gray-200" />
                        <div className="h-3 w-20 rounded bg-gray-100" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-28 rounded-lg bg-gray-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-gray-200 bg-gray-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="h-6 w-24 rounded-full bg-gray-200" />
                  <div className="h-6 w-28 rounded-full bg-gray-200" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-4 w-36 rounded bg-gray-200" />
                </div>
                <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        </>
      ) : !hasReports ? (
        <div className="px-5 py-14">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-10 text-center">
            <img
              src={noImg}
              alt="Bạn chưa gửi báo cáo nào"
              className="mx-auto mb-4 w-96 h-auto object-contain"
            />
            <p className="mt-4 text-base font-semibold text-gray-700">
              Bạn chưa gửi báo cáo nào.
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Khi bạn gửi báo cáo mới, trạng thái xử lý sẽ được cập nhật tại đây.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[880px] w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-blue-50/60 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Loại đối tượng
                  </th>
                  {/* <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID đối tượng
                  </th> */}
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Lý do
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ngày gửi
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => {
                  const targetType = getTargetTypeValue(report);
                  const targetId = getTargetIdValue(report);
                  const reason = getReasonValue(report);
                  const status = getStatusValue(report);
                  const reportId = getReportNumericId(report);

                  return (
                    <tr
                      key={reportId || `my-report-row-${index}`}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getTargetTypeBadgeClass(
                            targetType,
                          )}`}
                        >
                          {getTargetTypeLabel(targetType)}
                        </span>
                      </td>
                      {/* <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {targetId === null ? "--" : `#${targetId}`}
                      </td> */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                          {getReasonLabel(reason)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            status,
                          )}`}
                        >
                          {getMyReportStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDateTime(getCreatedAtValue(report))}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (reportId !== null) {
                                onViewDetail(reportId);
                              }
                            }}
                            disabled={reportId === null}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Eye size={15} />
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {reports.map((report, index) => {
              const targetType = getTargetTypeValue(report);
              const targetId = getTargetIdValue(report);
              const reason = getReasonValue(report);
              const status = getStatusValue(report);
              const reportId = getReportNumericId(report);

              return (
                <article
                  key={reportId || `my-report-card-${index}`}
                  className="rounded-xl border border-gray-200 bg-gray-50/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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

                  <dl className="mt-4 space-y-2 text-sm">
                    {/* <div className="flex items-start justify-between gap-3">
                      <dt className="text-gray-500">ID đối tượng</dt>
                      <dd className="font-semibold text-gray-700">
                        {targetId === null ? "--" : `#${targetId}`}
                      </dd>
                    </div> */}
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-gray-500">Lý do</dt>
                      <dd className="text-right font-medium text-gray-700">
                        {getReasonLabel(reason)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-gray-500">Ngày gửi</dt>
                      <dd className="text-right font-medium text-gray-700">
                        {formatDateTime(getCreatedAtValue(report))}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => {
                      if (reportId !== null) {
                        onViewDetail(reportId);
                      }
                    }}
                    disabled={reportId === null}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Eye size={15} />
                    Xem chi tiết
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}

      {!loading && hasReports ? (
        <ReportsPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
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
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Hiển thị <span className="font-semibold text-gray-700">{startItem}</span>{" "}
        - <span className="font-semibold text-gray-700">{endItem}</span> trong{" "}
        <span className="font-semibold text-gray-700">{totalItems}</span> báo cáo
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: pageCount }).map((_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${page === pageNumber
                ? "bg-blue-500 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
