import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type {
  ReportReason,
  ReportResponse,
  ReportStatus,
  ReportTargetType,
} from "../../../services/reportApi";
import {
  getAdminReportDetail,
  getAdminReports,
  updateAdminReportStatus,
} from "../../../services/reportApi";
import { AdminReportDetailModal } from "./components/AdminReportDetailModal";
import { AdminReportsTable } from "./components/AdminReportsTable";
import { AdminReportsToolbar } from "./components/AdminReportsToolbar";
import {
  ADMIN_REPORT_PAGE_SIZE,
  getAdminNoteValue,
  getDefaultUpdateStatus,
  getStatusValue,
} from "./utils";

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | null>(null);
  const [targetTypeFilter, setTargetTypeFilter] =
    useState<ReportTargetType | null>(null);
  const [reasonFilter, setReasonFilter] = useState<ReportReason | null>(null);

  const [page, setPage] = useState(1);
  const [refreshTick, setRefreshTick] = useState(0);

  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [detailReport, setDetailReport] = useState<ReportResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState<ReportStatus>("REVIEWING");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminReports({
          status: statusFilter,
          targetType: targetTypeFilter,
          reason: reasonFilter,
          page: page - 1,
          size: ADMIN_REPORT_PAGE_SIZE,
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
  }, [page, refreshTick, reasonFilter, statusFilter, targetTypeFilter]);

  useEffect(() => {
    if (selectedReportId === null) return;

    let cancelled = false;

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        setDetailReport(null);

        const response = await getAdminReportDetail(selectedReportId);

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

  useEffect(() => {
    setNextStatus(getDefaultUpdateStatus(getStatusValue(detailReport)));

    const currentAdminNote = getAdminNoteValue(detailReport);
    setAdminNote(currentAdminNote === "--" ? "" : currentAdminNote);
  }, [detailReport]);

  const handleCloseDetail = (force = false) => {
    if (updateLoading && !force) return;

    setSelectedReportId(null);
    setDetailReport(null);
    setDetailError(null);
    setDetailLoading(false);
    setNextStatus("REVIEWING");
    setAdminNote("");
  };

  const handleUpdateReport = async () => {
    if (selectedReportId === null) return;

    try {
      setUpdateLoading(true);

      const response = await updateAdminReportStatus(selectedReportId, {
        status: nextStatus,
        adminNote: adminNote.trim(),
      });

      if (!response.success) {
        toast.error(
          response.message || "Không thể cập nhật trạng thái báo cáo",
        );
        return;
      }

      toast.success("Cập nhật trạng thái báo cáo thành công.");
      handleCloseDetail(true);
      setRefreshTick((prev) => prev + 1);
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật báo cáo.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <AdminReportsToolbar
        statusFilter={statusFilter}
        targetTypeFilter={targetTypeFilter}
        reasonFilter={reasonFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onTargetTypeChange={(value) => {
          setTargetTypeFilter(value);
          setPage(1);
        }}
        onReasonChange={(value) => {
          setReasonFilter(value);
          setPage(1);
        }}
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <AdminReportsTable
        reports={reports}
        page={page}
        pageSize={ADMIN_REPORT_PAGE_SIZE}
        totalItems={totalItems}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
        onViewDetail={setSelectedReportId}
      />

      <AdminReportDetailModal
        open={selectedReportId !== null}
        report={detailReport}
        loading={detailLoading}
        error={detailError}
        updateLoading={updateLoading}
        nextStatus={nextStatus}
        adminNote={adminNote}
        onClose={handleCloseDetail}
        onStatusChange={setNextStatus}
        onAdminNoteChange={setAdminNote}
        onSubmit={handleUpdateReport}
      />
    </main>
  );
}
