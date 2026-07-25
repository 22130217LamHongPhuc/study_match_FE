import React, { useEffect, useState, useCallback } from "react";
import { Pagination } from "@mui/material";
import { isApiSuccess } from "../../config/apiClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useConfirm } from "../../components/modal/ConfirmModal";
import {
  ArrowLeft, Bookmark, FileText, Clock, Star, Eye,
  Download, AlertTriangle, Trash2, Edit3, RefreshCw, X, FolderOpen
} from "lucide-react";

import DocumentDetailModal from "./components/DocumentDetailModal";
import { getAllSubjects, Subject } from "../../services/GroupService";
import {
  getMyBookmarks,
  getMyUploadedDocuments,
  unbookmarkDocument,
  DocumentResponse,
  DocumentDetailResponse
} from "../../services/DocumentService";
import { CATEGORIES } from "./components/UploadDocumentModal";
import myLibraryImg from "../../assets/img/my-library.png";

type ActiveTab = "SAVED" | "CONTRIBUTED" | "PENDING" | "PUBLISHED" | "REJECTED";

export default function MyLibraryPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<ActiveTab>("SAVED");
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [savedDocs, setSavedDocs] = useState<DocumentResponse[]>([]);
  const [contributedDocs, setContributedDocs] = useState<DocumentDetailResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageIndex = page - 1;
      if (activeTab === "SAVED") {
        const res = await getMyBookmarks(pageIndex, 9);
        if (isApiSuccess(res) && res.data) {
          const filtered = (res.data.content || []).filter(d => (d as any).status !== "HIDDEN");
          setSavedDocs(filtered);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || 0);
        } else {
          setSavedDocs([]);
          setError(res.message || "Không thể tải danh sách tài liệu đã lưu.");
        }
      } else {
        const statusMap: Record<ActiveTab, string | undefined> = {
          SAVED: undefined,
          CONTRIBUTED: undefined,
          PENDING: "PENDING",
          PUBLISHED: "PUBLISHED",
          REJECTED: "REJECTED"
        };
        const status = statusMap[activeTab];
        const res = await getMyUploadedDocuments(status, pageIndex, 9);
        if (isApiSuccess(res) && res.data) {
          setContributedDocs(res.data.content || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || 0);
        } else {
          setContributedDocs([]);
          setError(res.message || "Không thể tải danh sách tài liệu đóng góp.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUnbookmark = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: "Hủy lưu tài liệu",
      message: "Bạn có chắc chắn muốn bỏ lưu tài liệu này khỏi thư viện cá nhân?",
      type: "warning",
      confirmText: "Hủy lưu",
      cancelText: "Hủy",
    });
    if (!confirmed) return;

    try {
      const res = await unbookmarkDocument(docId);
      if (isApiSuccess(res)) {
        toast.success("Đã hủy lưu tài liệu thành công");
        void loadData();
      } else {
        toast.error(res.message || "Không thể hủy lưu tài liệu.");
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const handleResubmit = (docId: number) => {
    toast.info("Chức năng sửa và gửi duyệt lại tài liệu đang được phát triển.");
  };

  const handleDeleteUploaded = async (docId: number) => {
    const confirmed = await confirm({
      title: "Xóa tài liệu",
      message: "Bạn có chắc chắn muốn xóa tài liệu này? Thao tác này không thể hoàn tác.",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy",
    });
    if (!confirmed) return;
    toast.info("Hệ thống hiện tại chưa hỗ trợ xóa tài liệu đã gửi duyệt.");
  };

  const getSubjectName = (subjectId: number) => {
    const found = subjects.find(s => s.subjectId === subjectId);
    return found ? found.subjectName : `Môn học #${subjectId}`;
  };

  const getCategoryLabel = (catVal: string) => {
    const found = CATEGORIES.find(c => c.value === catVal);
    return found ? found.label : "Khác";
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
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 font-sans">
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || "bg-slate-400"}`} />
        {labels[status] || status}
      </span>
    );
  };

  const getFileIconColor = (fileType: string) => {
    return "bg-slate-50 text-slate-400";
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const tabsConfig: Array<{ label: string; value: ActiveTab }> = [
    { label: "Đã lưu", value: "SAVED" },
    { label: "Đã đóng góp", value: "CONTRIBUTED" },
    { label: "Đang chờ duyệt", value: "PENDING" },
    { label: "Đã xuất bản", value: "PUBLISHED" },
    { label: "Bị từ chối", value: "REJECTED" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <button
          type="button"
          onClick={() => navigate("/documents")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Quay lại thư viện
        </button>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={myLibraryImg}
              alt="Thư viện của tôi"
              className="h-28 w-auto object-contain mix-blend-multiply"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Thư viện của tôi</h1>
              <p className="text-sm text-gray-500">
                Xem các tài liệu bạn đã lưu hoặc theo dõi trạng thái các tài liệu đã đóng góp.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {tabsConfig.map(t => {
            const isActive = activeTab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveTab(t.value)}
                className={`flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-transparent bg-transparent text-gray-500 hover:text-blue-600"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <SkeletonGrid />}

      {!loading && error && (
        <section className="rounded-xl border border-rose-100 bg-rose-50/50 p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h2 className="text-base font-bold text-rose-900 mb-1">Lỗi tải dữ liệu</h2>
          <p className="text-sm text-rose-700 mb-4 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none"
          >
            Thử lại
          </button>
        </section>
      )}

      {!loading && !error && (
        <>
          {activeTab === "SAVED" ? (
            savedDocs.length === 0 ? (
              <EmptyState message="Chưa có tài liệu nào được lưu trong thư mục của bạn." />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {savedDocs.map(doc => (
                  <article
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_20px_rgba(37,99,235,0.04)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          {getCategoryLabel(doc.category)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleUnbookmark(e, doc.id)}
                          className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                          title="Hủy lưu tài liệu"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex gap-4 items-start mb-4">
                        <div className={`flex w-11 h-11 items-center justify-center rounded-xl shrink-0 ${getFileIconColor(doc.fileType)}`}>
                          <FileText size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {getSubjectName(doc.subjectId)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-400 font-semibold">
                      <span>{doc.fileType?.toUpperCase()} · {formatFileSize(doc.fileSize)}</span>
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-gray-600">{doc.averageRating ? doc.averageRating.toFixed(1) : "—"}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            contributedDocs.length === 0 ? (
              <EmptyState message="Không tìm thấy tài liệu đóng góp nào." />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {contributedDocs.map(doc => (
                  <article
                    key={doc.id}
                    onClick={() => {
                      if (doc.status === "PUBLISHED") {
                        setSelectedDocId(doc.id);
                      } else {
                        toast.info("Tài liệu đang chờ duyệt hoặc bị từ chối, chỉ có thể xem sau khi được duyệt xuất bản.");
                      }
                    }}
                    className={`flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 ${
                      doc.status === "PUBLISHED"
                        ? "cursor-pointer hover:border-blue-200 hover:shadow-[0_4px_20px_rgba(37,99,235,0.04)]"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                          {getCategoryLabel(doc.category)}
                        </span>
                        {getStatusBadge(doc.status)}
                      </div>

                      <div className="flex gap-4 items-start mb-4">
                        <div className={`flex w-11 h-11 items-center justify-center rounded-xl shrink-0 ${getFileIconColor(doc.fileType)}`}>
                          <FileText size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gray-800 line-clamp-2">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {getSubjectName(doc.subjectId)}
                          </p>
                        </div>
                      </div>

                      {doc.status === "REJECTED" && (
                        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3">
                          <p className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Lý do từ chối:
                          </p>
                          <p className="text-xs text-red-600 mt-1 font-semibold leading-relaxed">
                            {doc.rejectionReason || "Nội dung tài liệu chưa phù hợp hoặc không rõ ràng."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">
                        {doc.fileType?.toUpperCase()} · {formatFileSize(doc.fileSize)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {doc.status === "REJECTED" && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleResubmit(doc.id); }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <RefreshCw size={12} />
                            Gửi lại
                          </button>
                        )}
                        {(doc.status === "PENDING" || doc.status === "REJECTED") && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteUploaded(doc.id); }}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                            title="Xóa đóng góp"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
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
        </>
      )}

      <DocumentDetailModal
        documentId={selectedDocId}
        onClose={() => {
          setSelectedDocId(null);
          void loadData();
        }}
        onBookmarkChanged={() => void loadData()}
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex justify-between mb-3">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-4 items-start mb-4">
              <div className="w-11 h-11 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-150 rounded" />
              </div>
            </div>
          </div>
          <div className="h-4 w-1/3 bg-gray-150 rounded border-t border-gray-100 pt-3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white py-12 px-4 text-center shadow-sm">
      <FolderOpen className="mx-auto h-14 w-14 text-gray-300 mb-3" />
      <h2 className="text-base font-bold text-gray-800 mb-1">Thư mục trống</h2>
      <p className="text-sm text-gray-500 max-w-md mx-auto">{message}</p>
    </section>
  );
}
