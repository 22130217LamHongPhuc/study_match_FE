import React, { useEffect, useState, useCallback } from "react";
import {
  FolderOpen, FileText, Search, Eye, Calendar, AlertTriangle
} from "lucide-react";
import { Pagination } from "@mui/material";
import { toast } from "react-toastify";
import { isApiSuccess } from "../../../config/apiClient";
import { useConfirm } from "../../../components/modal/ConfirmModal";
import {
  getAdminDocuments,
  getAdminDocumentDetail,
  approveDocument,
  rejectDocument,
  hideDocument,
  restoreDocument,
  AdminDocumentResponse
} from "../../../services/DocumentService";
import { getAllSubjects, Subject } from "../../../services/GroupService";
import { CATEGORIES } from "../../Documents/components/UploadDocumentModal";

import AdminDocumentDetailModal from "./components/AdminDocumentDetailModal";
import ReasonModal from "./components/ReasonModal";

export default function AdminDocumentsPage() {
  const confirm = useConfirm();
  const [documents, setDocuments] = useState<AdminDocumentResponse[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedDoc, setSelectedDoc] = useState<AdminDocumentResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actionModal, setActionModal] = useState<{
    type: "REJECT" | "HIDE";
    docId: number;
    docTitle: string;
  } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [reasonError, setReasonError] = useState("");

  const loadSubjects = useCallback(async () => {
    try {
      const res = await getAllSubjects();
      if (isApiSuccess(res) && res.data) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        search: searchQuery.trim() || undefined,
        status: activeTab === "ALL" ? undefined : activeTab,
        subjectId: selectedSubjectId || undefined,
        category: selectedCategory || undefined,
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
        page: page - 1,
        size: 10
      };

      const res = await getAdminDocuments(queryParams);
      if (isApiSuccess(res) && res.data) {
        setDocuments(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setDocuments([]);
        setError(res.message || "Không thể tải danh sách tài liệu kiểm duyệt.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedSubjectId, selectedCategory, startDate, endDate, page]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeTab, selectedSubjectId, selectedCategory, startDate, endDate]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const refreshDocumentDetail = async (docId: number) => {
    try {
      const res = await getAdminDocumentDetail(docId);
      if (isApiSuccess(res) && res.data) {
        setSelectedDoc(res.data);
        setDocuments(prev => prev.map(d => d.id === docId ? res.data : d));
      }
    } catch { /* silent */ }
  };

  const handleApprove = async (doc: AdminDocumentResponse) => {
    const confirmed = await confirm({
      title: "Duyệt tài liệu",
      message: `Bạn có chắc chắn muốn duyệt tài liệu "${doc.title}"?`,
      type: "info",
      confirmText: "Duyệt",
      cancelText: "Hủy",
    });
    if (!confirmed) return;

    setActionLoadingId(doc.id);
    try {
      const res = await approveDocument(doc.id);
      if (isApiSuccess(res)) {
        toast.success("Đã duyệt xuất bản tài liệu thành công");
        void loadDocuments();
        if (selectedDoc?.id === doc.id) {
          void refreshDocumentDetail(doc.id);
        }
      } else {
        toast.error(res.message || "Duyệt tài liệu thất bại");
        void loadDocuments();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (doc: AdminDocumentResponse) => {
    const confirmed = await confirm({
      title: "Khôi phục tài liệu",
      message: `Bạn có chắc chắn muốn khôi phục xuất bản tài liệu "${doc.title}"?`,
      type: "info",
      confirmText: "Khôi phục",
      cancelText: "Hủy",
    });
    if (!confirmed) return;

    setActionLoadingId(doc.id);
    try {
      const res = await restoreDocument(doc.id);
      if (isApiSuccess(res)) {
        toast.success("Khôi phục xuất bản tài liệu thành công");
        void loadDocuments();
        if (selectedDoc?.id === doc.id) {
          void refreshDocumentDetail(doc.id);
        }
      } else {
        toast.error(res.message || "Khôi phục tài liệu thất bại");
        void loadDocuments();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActionModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    if (!reasonText.trim()) {
      setReasonError("Lý do không được bỏ trống");
      return;
    }

    const { type, docId } = actionModal;
    setActionLoadingId(docId);
    setActionModal(null);

    try {
      const res = type === "REJECT"
        ? await rejectDocument(docId, reasonText.trim())
        : await hideDocument(docId, reasonText.trim());

      if (isApiSuccess(res)) {
        toast.success(type === "REJECT" ? "Đã từ chối duyệt tài liệu" : "Đã ẩn tài liệu thành công");
        void loadDocuments();
        if (selectedDoc?.id === docId) {
          void refreshDocumentDetail(docId);
        }
      } else {
        toast.error(res.message || "Thao tác thất bại");
        void loadDocuments();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetail = async (docId: number) => {
    setDetailLoading(true);
    try {
      const res = await getAdminDocumentDetail(docId);
      if (isApiSuccess(res) && res.data) {
        setSelectedDoc(res.data);
      } else {
        toast.error("Không tìm thấy thông tin tài liệu chi tiết");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSubjectId("");
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSubjectName = (subjectId: number) => {
    const found = subjects.find(s => s.subjectId === subjectId);
    return found ? found.subjectName : `Môn học #${subjectId}`;
  };

  const getStatusBadge = (status: string) => {
    const dotStyles: Record<string, string> = {
      PENDING: "bg-amber-500",
      PUBLISHED: "bg-emerald-500",
      REJECTED: "bg-rose-500",
      HIDDEN: "bg-slate-400",
    };
    const labels: Record<string, string> = {
      PENDING: "Chờ duyệt",
      PUBLISHED: "Đã xuất bản",
      REJECTED: "Bị từ chối",
      HIDDEN: "Đã ẩn",
    };
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || "bg-slate-400"}`} />
        {labels[status] || status}
      </span>
    );
  };

  const tabsConfig = [
    { label: "Tất cả", value: "ALL" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đã xuất bản", value: "PUBLISHED" },
    { label: "Bị từ chối", value: "REJECTED" },
    { label: "Đã ẩn", value: "HIDDEN" },
  ];

  return (
    <div className="min-h-full bg-slate-50/50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Quản lý tài liệu học tập
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm duyệt, phê duyệt, từ chối và quản lý các tài liệu học tập do sinh viên tải lên hệ thống.
          </p>
        </div>

        <section className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabsConfig.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveTab(t.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === t.value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
              />
            </div>

            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all bg-white"
            >
              <option value="">Lọc theo môn học</option>
              {subjects.map(s => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all bg-white"
            >
              <option value="">Lọc thể loại</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 bg-white">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full py-1.5 text-xs outline-none bg-transparent"
                title="Từ ngày"
              />
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 bg-white">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full py-1.5 text-xs outline-none bg-transparent"
                title="Đến ngày"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </section>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-100 border-t-blue-500" />
            <span className="text-sm font-semibold text-slate-400">Đang tải danh sách tài liệu...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
            <h3 className="text-base font-bold text-rose-900 mb-1">Lỗi tải dữ liệu</h3>
            <p className="text-sm text-rose-700 mb-4">{error}</p>
            <button onClick={loadDocuments} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
              Thử lại
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <FolderOpen className="mx-auto h-14 w-14 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Không tìm thấy tài liệu phù hợp</h3>
            <p className="text-sm text-slate-500">Chưa có tài liệu nào trong thư mục kiểm duyệt này.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Tài liệu</th>
                    <th className="px-6 py-4">Môn học</th>
                    <th className="px-6 py-4">Người đăng</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Báo cáo</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {documents.map(doc => {
                    const isActionLoading = actionLoadingId === doc.id;

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-slate-400 shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={doc.title}>
                                {doc.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {doc.fileType?.toUpperCase()} · {formatFileSize(doc.fileSize)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium truncate max-w-[150px]" title={getSubjectName(doc.subjectId)}>
                          {getSubjectName(doc.subjectId)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                          {doc.uploaderName || `User #${doc.uploaderId}`}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {doc.unresolvedReportCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                              <AlertTriangle size={13} />
                              {doc.unresolvedReportCount} báo cáo
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetail(doc.id)}
                              disabled={isActionLoading || detailLoading}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline disabled:opacity-50"
                              title="Xem chi tiết & Preview"
                            >
                              Xem
                            </button>

                            {doc.status === "PENDING" && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleApprove(doc)}
                                  disabled={isActionLoading}
                                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50"
                                >
                                  Duyệt
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => setActionModal({ type: "REJECT", docId: doc.id, docTitle: doc.title })}
                                  disabled={isActionLoading}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline disabled:opacity-50"
                                >
                                  Từ chối
                                </button>
                              </>
                            )}

                            {doc.status === "PUBLISHED" && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => setActionModal({ type: "HIDE", docId: doc.id, docTitle: doc.title })}
                                  disabled={isActionLoading}
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline disabled:opacity-50"
                                >
                                  Ẩn đi
                                </button>
                              </>
                            )}

                            {(doc.status === "HIDDEN" || doc.status === "REJECTED") && (
                              <>
                                <span className="text-slate-300">|</span>
                                <button
                                  onClick={() => handleRestore(doc)}
                                  disabled={isActionLoading}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                                >
                                  Khôi phục
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center py-4 border-t border-slate-100 bg-slate-50/20">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      fontWeight: 600,
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <AdminDocumentDetailModal
        doc={selectedDoc}
        subjects={subjects}
        loading={detailLoading}
        onClose={() => setSelectedDoc(null)}
        onApprove={handleApprove}
        onReject={(id, title) => setActionModal({ type: "REJECT", docId: id, docTitle: title })}
        onHide={(id, title) => setActionModal({ type: "HIDE", docId: id, docTitle: title })}
        onRestore={handleRestore}
        actionLoadingId={actionLoadingId}
      />

      {actionModal && (
        <ReasonModal
          type={actionModal.type}
          docTitle={actionModal.docTitle}
          onClose={() => {
            setActionModal(null);
            setReasonText("");
            setReasonError("");
          }}
          onSubmit={handleActionModalSubmit}
          reasonText={reasonText}
          setReasonText={setReasonText}
          reasonError={reasonError}
          setReasonError={setReasonError}
        />
      )}
    </div>
  );
}
