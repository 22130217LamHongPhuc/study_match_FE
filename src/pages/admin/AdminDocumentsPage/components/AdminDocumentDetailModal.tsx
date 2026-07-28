import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Tag, FileText, Clock, User, AlertTriangle, AlertCircle, Download, BookOpen, HardDrive, Star, Eye
} from "lucide-react";
import {
  AdminDocumentResponse,
  getDownloadUrl,
  getPreviewUrl
} from "../../../../services/DocumentService";
import { Subject } from "../../../../services/GroupService";
import { CATEGORIES } from "../../../Documents/components/UploadDocumentModal";
import DetailInfoRow from "./DetailInfoRow";

interface AdminDocumentDetailModalProps {
  doc: AdminDocumentResponse | null;
  subjects: Subject[];
  loading: boolean;
  onClose: () => void;
  onApprove: (doc: AdminDocumentResponse) => void;
  onReject: (id: number, title: string) => void;
  onHide: (id: number, title: string) => void;
  onRestore: (doc: AdminDocumentResponse) => void;
  actionLoadingId: number | null;
}

export default function AdminDocumentDetailModal({
  doc,
  subjects,
  loading,
  onClose,
  onApprove,
  onReject,
  onHide,
  onRestore,
  actionLoadingId
}: AdminDocumentDetailModalProps) {
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (doc) {
      setPreviewLoading(true);
      setPreviewError(false);
    }
  }, [doc]);

  if (!doc && !loading) return null;

  const subjectName = subjects.find(s => s.subjectId === doc?.subjectId)?.subjectName || `Môn học #${doc?.subjectId}`;
  const fileType = doc?.fileType?.toLowerCase() || "";
  const isPDF = fileType === "pdf";
  const isOfficeDoc = ["doc", "docx", "ppt", "pptx", "pwp"].includes(fileType);

  const getFileIconColor = (fileType: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-red-50 text-red-500",
      docx: "bg-blue-50 text-blue-500",
      pptx: "bg-orange-50 text-orange-500",
    };
    return colors[fileType?.toLowerCase()] || "bg-gray-50 text-gray-500";
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || "bg-slate-400"}`} />
        {labels[status] || status}
      </span>
    );
  };

  const handleDownload = () => {
    if (!doc) return;
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isActionLoading = actionLoadingId === doc?.id;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="max-h-[calc(100vh-60px)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl font-sans">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {loading ? "Đang tải chi tiết..." : doc?.title}
            </h2>
            {doc && (
              <p className="text-xs text-gray-500 truncate">
                Môn học: {subjectName} · Thể loại: {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="p-8 space-y-7 font-sans">
          {loading ? (
            <DetailSkeleton />
          ) : doc && (
            <>
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-2">
                <StatCard icon={<Eye size={16} />} label="Lượt xem" value={doc.viewCount.toLocaleString("vi-VN")} />
                <StatCard icon={<Download size={16} />} label="Lượt tải" value={doc.downloadCount.toLocaleString("vi-VN")} />
                <StatCard icon={<Star size={16} />} label="Đánh giá TB" value={doc.averageRating ? doc.averageRating.toFixed(1) : "—"} />
                <StatCard icon={<User size={16} />} label="Lượt đánh giá" value={doc.ratingCount.toLocaleString("vi-VN")} />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DetailInfoRow icon={<BookOpen size={14} />} label="Môn học" value={subjectName} />
                <DetailInfoRow icon={<Tag size={14} />} label="Loại tài liệu" value={CATEGORIES.find(c => c.value === doc.category)?.label || doc.category} />
                <DetailInfoRow icon={<FileText size={14} />} label="Tên file gốc" value={doc.originalFileName} />
                <DetailInfoRow icon={<HardDrive size={14} />} label="Định dạng file" value={doc.fileType?.toUpperCase() || "Khác"} />
                <DetailInfoRow icon={<HardDrive size={14} />} label="Dung lượng file" value={formatFileSize(doc.fileSize)} />
                <DetailInfoRow icon={<Clock size={14} />} label="Ngày tải lên" value={new Date(doc.createdAt).toLocaleString("vi-VN")} />
                <DetailInfoRow icon={<User size={14} />} label="Người tải lên" value={doc.uploaderName || `User #${doc.uploaderId}`} />
                <DetailInfoRow icon={<AlertTriangle size={14} />} label="Trạng thái kiểm duyệt" value={getStatusBadge(doc.status)} />
                {doc.reviewerId && (
                  <DetailInfoRow icon={<User size={14} />} label="Admin xử lý" value={`User #${doc.reviewerId}`} />
                )}
              </div>

              {doc.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h4>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                    {doc.description}
                  </p>
                </div>
              )}

              {doc.status === "REJECTED" && doc.rejectionReason && (
                <div className="rounded-lg border border-red-150 bg-red-50/50 p-4">
                  <h4 className="text-sm font-bold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    Lý do từ chối kiểm duyệt
                  </h4>
                  <p className="text-sm text-red-700 mt-1 font-semibold leading-relaxed">
                    {doc.rejectionReason}
                  </p>
                </div>
              )}

              {doc.status === "HIDDEN" && doc.hiddenReason && (
                <div className="rounded-lg border border-gray-250 bg-gray-50 p-4">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    Lý do ẩn tài liệu
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 font-semibold leading-relaxed">
                    {doc.hiddenReason}
                  </p>
                </div>
              )}

              {doc.unresolvedReportCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h4 className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle size={16} />
                    Tài liệu này có {doc.unresolvedReportCount} báo cáo vi phạm chưa xử lý
                  </h4>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Xem trước nội dung</h4>
                {isPDF ? (
                  <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50" style={{ minHeight: 400 }}>
                    {previewLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 z-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-100 border-t-blue-500" />
                        <span className="text-xs font-semibold text-gray-400">Đang tải bản xem trước...</span>
                      </div>
                    )}
                    {previewError ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <AlertCircle className="h-10 w-10 text-gray-300" />
                        <p className="text-sm text-gray-500 font-medium">Không thể tải bản xem trước</p>
                      </div>
                    ) : (
                      <iframe
                        src={doc.fileUrl}
                        title="Preview"
                        className="w-full border-0"
                        style={{ height: 480 }}
                        onLoad={() => setPreviewLoading(false)}
                        onError={() => { setPreviewLoading(false); setPreviewError(true); }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/50 py-10 gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getFileIconColor(doc.fileType)}`}>
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{doc.originalFileName}</p>
                    <p className="text-xs text-gray-400">
                      {isOfficeDoc
                        ? `Hệ thống chưa hỗ trợ xem trước cho định dạng ${doc.fileType?.toUpperCase()}`
                        : `Tài liệu định dạng ${doc.fileType?.toUpperCase()} không hỗ trợ preview trực tuyến.`
                      }
                    </p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                    >
                      <Download size={14} />
                      Tải file gốc xuống
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {doc && (
          <div className="sticky bottom-0 z-10 flex flex-wrap gap-2 border-t border-gray-100 bg-white px-8 py-5">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              <Download size={14} />
              Tải file
            </button>

            <div className="ml-auto flex gap-2">
              {doc.status === "PENDING" && (
                <>
                  <button
                    onClick={() => onApprove(doc)}
                    disabled={isActionLoading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => onReject(doc.id, doc.title)}
                    disabled={isActionLoading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Từ chối duyệt
                  </button>
                </>
              )}

              {doc.status === "PUBLISHED" && (
                <button
                  onClick={() => onHide(doc.id, doc.title)}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Ẩn tài liệu
                </button>
              )}

              {(doc.status === "HIDDEN" || doc.status === "REJECTED") && (
                <button
                  onClick={() => onRestore(doc)}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Khôi phục
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm font-sans">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 font-sans">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-3.5">
            <div className="h-7 w-7 rounded-lg bg-gray-200 mb-2" />
            <div className="h-5 w-12 rounded bg-gray-200 mb-1" />
            <div className="h-3 w-16 rounded bg-gray-150" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5">
            <div className="h-7 w-7 rounded-lg bg-gray-200 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-16 rounded bg-gray-150" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-24 rounded-lg bg-gray-100" />
      <div className="h-[300px] rounded-lg bg-gray-100" />
    </div>
  );
}
