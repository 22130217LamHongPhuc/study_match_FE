import React from "react";
import { FileText, Eye, Download, Star, Bookmark } from "lucide-react";
import { DocumentResponse } from "../../../services/DocumentService";

interface DocumentCardProps {
  doc: DocumentResponse;
  isBookmarked: boolean;
  subjectName: string;
  categoryLabel: string;
  onToggleSave: (e: React.MouseEvent, docId: number) => void;
  onClick: () => void;
}

export default function DocumentCard({
  doc,
  isBookmarked,
  subjectName,
  categoryLabel,
  onToggleSave,
  onClick
}: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_20px_rgba(37,99,235,0.04)]"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {categoryLabel}
          </span>
          <button
            type="button"
            onClick={(e) => onToggleSave(e, doc.id)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50 hover:text-blue-500 transition-colors focus:outline-none"
            title={isBookmarked ? "Bỏ lưu tài liệu" : "Lưu tài liệu"}
          >
            <Bookmark size={18} className={isBookmarked ? "fill-blue-500 text-blue-500" : "text-gray-400"} />
          </button>
        </div>

        <div className="flex gap-4 items-start mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold shadow-sm shrink-0">
            <FileText size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-500 transition-colors line-clamp-1 mb-1">
              {doc.title}
            </h3>
            <p className="text-xs text-gray-500 mb-1">
              Môn học: {subjectName}
            </p>
            <p className="text-xs text-gray-400 line-clamp-2">
              {doc.description || "Không có mô tả cho tài liệu này."}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            {doc.averageRating.toFixed(1)} ({doc.ratingCount})
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Eye size={14} /> {doc.viewCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Download size={14} /> {doc.downloadCount}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-2">
          <span>Đóng góp: {doc.uploaderName || `Thành viên #${doc.uploaderId}`}</span>
          <span>{formatFileSize(doc.fileSize)}</span>
        </div>
      </div>
    </article>
  );
}
