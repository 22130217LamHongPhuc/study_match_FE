import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  X, Download, Bookmark, BookmarkCheck, Share2, Flag, Star,
  Eye, FileText, Clock, User, Tag, HardDrive, ExternalLink, AlertCircle, FileQuestion, BookOpen
} from "lucide-react";
import { toast } from "react-toastify";
import { isApiSuccess } from "../../../config/apiClient";
import {
  getDocumentDetail,
  getBookmarkStatus,
  bookmarkDocument,
  unbookmarkDocument,
  getMyRating,
  rateDocument,
  getDocuments,
  getDownloadUrl,
  getPreviewUrl,
  getDocumentRatings,
  DocumentDetailResponse,
  DocumentRatingResponse,
  DocumentResponse,
} from "../../../services/DocumentService";
import { getAllSubjects, Subject } from "../../../services/GroupService";
import ReportDocumentModal from "./ReportDocumentModal";
import { CATEGORIES } from "./UploadDocumentModal";

interface DocumentDetailModalProps {
  documentId: number | null;
  onClose: () => void;
  onBookmarkChanged?: (docId: number, isBookmarked: boolean) => void;
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getCategoryLabel = (category: string) => {
  const found = CATEGORIES.find(c => c.value === category);
  return found ? found.label : "Khác";
};

const getFileIcon = (fileType: string) => {
  const colors: Record<string, string> = {
    pdf: "bg-red-50 text-red-500",
    docx: "bg-blue-50 text-blue-500",
    pptx: "bg-orange-50 text-orange-500",
  };
  return colors[fileType?.toLowerCase()] || "bg-gray-50 text-gray-500";
};

export default function DocumentDetailModal({ documentId, onClose, onBookmarkChanged }: DocumentDetailModalProps) {
  const [doc, setDoc] = useState<DocumentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [myRating, setMyRating] = useState<DocumentRatingResponse | null>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [reviews, setReviews] = useState<DocumentRatingResponse[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [reviewsTotalItems, setReviewsTotalItems] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [relatedDocs, setRelatedDocs] = useState<DocumentResponse[]>([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reportOpen, setReportOpen] = useState(false);

  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await getDocumentDetail(documentId);
      if (isApiSuccess(res) && res.data) {
        setDoc(res.data);
      } else {
        if (res.message?.includes("NOT_FOUND") || (res.code as string) === "DOCUMENT_NOT_FOUND") {
          setNotFound(true);
        } else {
          setError(res.message || "Không thể tải thông tin tài liệu");
        }
      }
    } catch {
      setError("Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadBookmarkStatus = useCallback(async () => {
    if (!documentId) return;
    try {
      const res = await getBookmarkStatus(documentId);
      if (isApiSuccess(res)) {
        setIsBookmarked(res.data === true);
      }
    } catch { /* silent */ }
  }, [documentId]);

  const loadMyRating = useCallback(async () => {
    if (!documentId) return;
    try {
      const res = await getMyRating(documentId);
      if (isApiSuccess(res) && res.data) {
        setMyRating(res.data);
        setSelectedStar(res.data.score);
        setReviewText(res.data.review || "");
      } else {
        setMyRating(null);
        setSelectedStar(0);
        setReviewText("");
      }
    } catch {
      setMyRating(null);
      setSelectedStar(0);
      setReviewText("");
    }
  }, [documentId]);

  const loadRelatedDocs = useCallback(async (subjectId: number, currentDocId: number) => {
    try {
      const res = await getDocuments({ subjectId, size: 4, sortBy: "downloads" });
      if (isApiSuccess(res) && res.data?.content) {
        setRelatedDocs(res.data.content.filter(d => d.id !== currentDocId).slice(0, 3));
      }
    } catch { /* silent */ }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const res = await getAllSubjects();
      if (isApiSuccess(res) && res.data) {
        setSubjects(res.data);
      }
    } catch { /* silent */ }
  }, []);

  const loadReviews = useCallback(async (page: number) => {
    if (!documentId) return;
    setReviewsLoading(true);
    try {
      const res = await getDocumentRatings(documentId, page, 5);
      if (isApiSuccess(res) && res.data) {
        setReviews(res.data.content || []);
        setReviewsTotalPages(res.data.totalPages);
        setReviewsTotalItems(res.data.totalElements);
      }
    } catch { /* silent */ }
    finally {
      setReviewsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    setDoc(null);
    setMyRating(null);
    setSelectedStar(0);
    setReviewText("");
    setRelatedDocs([]);
    setPreviewLoading(true);
    setPreviewError(false);
    setReviewsPage(0);
    loadDocument();
    loadBookmarkStatus();
    loadMyRating();
    loadSubjects();
  }, [documentId, loadDocument, loadBookmarkStatus, loadMyRating, loadSubjects]);

  useEffect(() => {
    if (documentId) {
      loadReviews(reviewsPage);
    }
  }, [documentId, reviewsPage, loadReviews]);

  useEffect(() => {
    if (doc?.subjectId) {
      loadRelatedDocs(doc.subjectId, doc.id);
    }
  }, [doc?.subjectId, doc?.id, loadRelatedDocs]);

  useEffect(() => {
    if (!documentId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !reportOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [documentId, onClose, reportOpen]);

  const handleToggleBookmark = async () => {
    if (!doc || bookmarkLoading) return;
    setBookmarkLoading(true);
    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);
    try {
      const res = wasBookmarked
        ? await unbookmarkDocument(doc.id)
        : await bookmarkDocument(doc.id);
      if (isApiSuccess(res)) {
        toast.success(wasBookmarked ? "Đã hủy lưu tài liệu" : "Đã lưu tài liệu");
        onBookmarkChanged?.(doc.id, !wasBookmarked);
      } else {
        setIsBookmarked(wasBookmarked);
        toast.error(res.message || "Thao tác thất bại");
      }
    } catch {
      setIsBookmarked(wasBookmarked);
      toast.error("Đã xảy ra lỗi");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleDownload = () => {
    if (!doc) return;
    const token = localStorage.getItem("accessToken");
    const url = getDownloadUrl(doc.id);
    const a = document.createElement("a");
    a.href = token ? `${url}?token=${encodeURIComponent(token)}` : url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Đã sao chép liên kết tài liệu");
    }).catch(() => {
      toast.error("Không thể sao chép liên kết");
    });
  };

  const handleSubmitRating = async () => {
    if (!doc || !selectedStar || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      const res = await rateDocument(doc.id, selectedStar, reviewText.trim());
      if (isApiSuccess(res) && res.data) {
        setMyRating(res.data);
        toast.success(myRating ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá");
        loadDocument();
        if (reviewsPage === 0) {
          loadReviews(0);
        } else {
          setReviewsPage(0);
        }
      } else {
        toast.error(res.message || "Không thể gửi đánh giá");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const subjectName = subjects.find(s => s.subjectId === doc?.subjectId)?.subjectName || `Môn học #${doc?.subjectId}`;
  const fileType = doc?.fileType?.toLowerCase() || "";
  const isPDF = fileType === "pdf";
  const isOfficeDoc = ["doc", "docx", "ppt", "pptx", "pwp"].includes(fileType);
  const currentUserId = localStorage.getItem("userId");
  const isMyDocument = doc && String(doc.uploaderId) === currentUserId;

  if (!documentId) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="max-h-[calc(100vh-60px)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl font-sans">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">
              {loading ? "Đang tải..." : doc?.title || "Chi tiết tài liệu"}
            </h2>
            {doc && (
              <p className="text-xs text-gray-500 mt-1">
                Môn học: {subjectName} · Thể loại: {getCategoryLabel(doc.category)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          >
            Đóng
          </button>
        </div>

        <div className="p-8 space-y-7">
          {loading && <DetailSkeleton />}

          {!loading && notFound && (
            <div className="py-16 text-center">
              <FileQuestion className="mx-auto h-14 w-14 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700 mb-1">Không tìm thấy tài liệu</h3>
              <p className="text-sm text-gray-500 mb-4">Tài liệu này có thể đã bị xóa hoặc chưa được phê duyệt.</p>
              <button onClick={onClose} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">
                Quay lại
              </button>
            </div>
          )}

          {!loading && error && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
              <h3 className="text-base font-bold text-rose-900 mb-1">Lỗi tải dữ liệu</h3>
              <p className="text-sm text-rose-700 mb-4">{error}</p>
              <button onClick={loadDocument} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && !notFound && doc && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-2">
                <StatCard icon={<Eye size={16} />} label="Lượt xem" value={doc.viewCount.toLocaleString("vi-VN")} />
                <StatCard icon={<Download size={16} />} label="Lượt tải" value={doc.downloadCount.toLocaleString("vi-VN")} />
                <StatCard icon={<Star size={16} />} label="Đánh giá TB" value={doc.averageRating ? doc.averageRating.toFixed(1) : "—"} />
                <StatCard icon={<User size={16} />} label="Lượt đánh giá" value={doc.ratingCount.toLocaleString("vi-VN")} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow icon={<BookOpen size={14} />} label="Môn học" value={subjectName} />
                <InfoRow icon={<Tag size={14} />} label="Loại tài liệu" value={getCategoryLabel(doc.category)} />
                <InfoRow icon={<HardDrive size={14} />} label="Dung lượng file" value={formatFileSize(doc.fileSize)} />
                <InfoRow icon={<Clock size={14} />} label="Ngày đăng tải" value={formatDate(doc.publishedAt || doc.createdAt)} />
                <InfoRow icon={<User size={14} />} label="Người đóng góp" value={doc.uploaderName || `User #${doc.uploaderId}`} />
                {doc.sourceName && (
                  <InfoRow icon={<ExternalLink size={14} />} label="Nguồn tài liệu" value={doc.sourceName} />
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

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Xem trước tài liệu</h4>
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
                        <button
                          onClick={() => { setPreviewError(false); setPreviewLoading(true); }}
                          className="mt-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : (
                      <iframe
                        key={previewError ? "retry" : "load"}
                        src={getPreviewUrl(doc.id)}
                        title="Xem trước tài liệu"
                        className="w-full border-0"
                        style={{ height: 500 }}
                        onLoad={() => setPreviewLoading(false)}
                        onError={() => { setPreviewLoading(false); setPreviewError(true); }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/50 py-12 gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${getFileIcon(doc.fileType)}`}>
                      <FileText size={28} />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{doc.originalFileName}</p>
                    <p className="text-xs text-gray-400">
                      {isOfficeDoc
                        ? `Hệ thống chưa hỗ trợ xem trước cho định dạng ${doc.fileType?.toUpperCase()}`
                        : `Định dạng ${doc.fileType?.toUpperCase()} không hỗ trợ xem trước trực tiếp`
                      }
                    </p>
                    <button
                      onClick={handleDownload}
                      className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                    >
                      <Download size={14} />
                      Tải xuống để xem
                    </button>
                  </div>
                )}
              </div>

              {!isMyDocument && (
                <div className="rounded-xl border border-gray-200 p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {myRating ? "Đánh giá của bạn" : "Đánh giá tài liệu"}
                  </h4>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        disabled={ratingSubmitting}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setSelectedStar(star)}
                        className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      >
                        <Star
                          size={24}
                          className={
                            (hoverStar || selectedStar) >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }
                        />
                      </button>
                    ))}
                    {selectedStar > 0 && (
                      <span className="ml-2 text-sm font-semibold text-amber-600">{selectedStar}/5</span>
                    )}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    disabled={ratingSubmitting}
                    rows={2}
                    placeholder="Nhận xét về tài liệu (tùy chọn)..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitRating}
                      disabled={!selectedStar || ratingSubmitting}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {ratingSubmitting ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Đang gửi...
                        </>
                      ) : myRating ? "Cập nhật đánh giá" : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              )}

              {/* Danh sách đánh giá từ người dùng */}
              <div className="rounded-xl border border-gray-200 p-5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">
                  Đánh giá từ người dùng ({reviewsTotalItems})
                </h4>

                {reviewsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-100 border-t-blue-500" />
                    <span className="text-xs text-gray-400">Đang tải đánh giá...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Chưa có đánh giá nào cho tài liệu này.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="flex items-start gap-3 border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
                        {/* User avatar */}
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {rev.userAvatar ? (
                            <img src={rev.userAvatar} alt={rev.userName} className="h-full w-full object-cover" />
                          ) : (
                            rev.userName?.charAt(0).toUpperCase() || "?"
                          )}
                        </div>
                        
                        {/* Rating content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-700 truncate">
                              {rev.userName || `User #${rev.userId}`}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatDate(rev.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 mt-0.5 mb-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={
                                  rev.score >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                                }
                              />
                            ))}
                          </div>

                          {rev.review ? (
                            <p className="text-xs text-gray-600 leading-relaxed break-words whitespace-pre-wrap bg-gray-50/50 rounded-lg p-2.5">
                              {rev.review}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Không có nhận xét</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {reviewsTotalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                        <button
                          type="button"
                          disabled={reviewsPage === 0}
                          onClick={() => setReviewsPage((prev) => prev - 1)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trang trước
                        </button>
                        <span className="text-xs font-semibold text-gray-500">
                          Trang {reviewsPage + 1} / {reviewsTotalPages}
                        </span>
                        <button
                          type="button"
                          disabled={reviewsPage >= reviewsTotalPages - 1}
                          onClick={() => setReviewsPage((prev) => prev + 1)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {relatedDocs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tài liệu liên quan</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {relatedDocs.map(rd => (
                      <button
                        key={rd.id}
                        type="button"
                        onClick={() => {
                          setDoc(null);
                          setLoading(true);
                          onClose();
                          setTimeout(() => {
                            const event = new CustomEvent("open-document-detail", { detail: rd.id });
                            window.dispatchEvent(event);
                          }, 100);
                        }}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-blue-200 hover:shadow-sm"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getFileIcon(rd.fileType)}`}>
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{rd.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {rd.fileType?.toUpperCase()} · {formatFileSize(rd.fileSize)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && !error && !notFound && doc && (
          <div className="sticky bottom-0 z-10 flex flex-wrap gap-2 border-t border-gray-100 bg-white px-6 py-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              <Download size={15} />
              Tải xuống
            </button>
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${isBookmarked
                  ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                } disabled:opacity-50`}
            >
              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isBookmarked ? "Đã lưu" : "Lưu"}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={15} />
              Chia sẻ
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors ml-auto"
            >
              <Flag size={15} />
              Báo cáo
            </button>
          </div>
        )}
      </div>

      {doc && (
        <ReportDocumentModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          documentId={doc.id}
          documentTitle={doc.title}
        />
      )}
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-gray-100 bg-white p-3.5 shadow-sm font-sans">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
        <p className="text-xs font-semibold text-gray-700 break-words">{value}</p>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
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
