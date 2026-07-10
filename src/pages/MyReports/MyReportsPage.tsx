import { useEffect, useState } from "react";
import reportImg from "../../assets/img/report.png";
import type { ReportResponse } from "../../services/reportApi";
import { getMyReportDetail, getMyReports } from "../../services/reportApi";
import { MyReportDetailModal } from "./components/MyReportDetailModal";
import { MyReportsTable } from "./components/MyReportsTable";
import { MY_REPORTS_PAGE_SIZE } from "./utils";

export default function MyReportsPage() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [detailReport, setDetailReport] = useState<ReportResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyReports({
          page: page - 1,
          size: MY_REPORTS_PAGE_SIZE,
        });

        if (cancelled) return;

        if (!response.success || !response.data) {
          setReports([]);
          setTotalItems(0);
          setTotalPages(1);
          setError(response.message || "Không thể tải danh sách báo cáo");
          return;
        }

        setReports(response.data.content ?? []);
        setTotalItems(response.data.totalElements ?? 0);
        setTotalPages(Math.max(response.data.totalPages ?? 0, 1));
      } catch {
        if (cancelled) return;

        setReports([]);
        setTotalItems(0);
        setTotalPages(1);
        setError("Có lỗi xảy ra khi tải danh sách báo cáo");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (selectedReportId === null) return;

    let cancelled = false;

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        setDetailReport(null);

        const response = await getMyReportDetail(selectedReportId);

        if (cancelled) return;

        if (!response.success || !response.data) {
          setDetailError(response.message || "Không thể tải chi tiết báo cáo");
          return;
        }

        setDetailReport(response.data);
      } catch {
        if (cancelled) return;
        setDetailError("Có lỗi xảy ra khi tải chi tiết báo cáo");
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedReportId]);

  const handleCloseDetail = () => {
    setSelectedReportId(null);
    setDetailReport(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  return (
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={reportImg}
                alt="Báo cáo của tôi"
                className="h-28 w-auto object-contain mix-blend-multiply"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Báo cáo của tôi
                </h1>
                <p className="text-sm text-gray-500">
                  Theo dõi trạng thái các báo cáo bạn đã gửi
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}

        <MyReportsTable
          reports={reports}
          page={page}
          pageSize={MY_REPORTS_PAGE_SIZE}
          totalItems={totalItems}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
          onViewDetail={setSelectedReportId}
        />
      </div>

      <MyReportDetailModal
        open={selectedReportId !== null}
        report={detailReport}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
      />
    </main>
  );
}
