import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { reportDocument } from "../../../services/DocumentService";
import { isApiSuccess } from "../../../config/apiClient";
import { toast } from "react-toastify";

interface ReportDocumentModalProps {
  open: boolean;
  onClose: () => void;
  documentId: number;
  documentTitle: string;
}

const REPORT_REASONS = [
  { value: "COPYRIGHT", label: "Vi phạm bản quyền" },
  { value: "INAPPROPRIATE_CONTENT", label: "Nội dung không phù hợp" },
  { value: "INCORRECT_SUBJECT", label: "Sai môn học" },
  { value: "MALWARE_OR_UNSAFE", label: "Mã độc hoặc không an toàn" },
  { value: "DUPLICATE", label: "Trùng lặp" },
  { value: "SPAM", label: "Spam / Quảng cáo" },
  { value: "OTHER", label: "Khác" },
];

export default function ReportDocumentModal({ open, onClose, documentId, documentTitle }: ReportDocumentModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ reason?: string; description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const newErrors: typeof errors = {};
    if (!reason) newErrors.reason = "Vui lòng chọn lý do báo cáo";
    if (reason === "OTHER" && !description.trim()) {
      newErrors.description = "Vui lòng mô tả chi tiết khi chọn \"Khác\"";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await reportDocument(documentId, reason, description.trim());
      if (isApiSuccess(res)) {
        toast.success("Gửi báo cáo thành công");
        onClose();
      } else {
        const msg = res.message || "Không thể gửi báo cáo";
        if (msg.toLowerCase().includes("đã báo cáo") || msg.toLowerCase().includes("duplicate")) {
          toast.warning("Bạn đã báo cáo tài liệu này trước đó");
        } else {
          toast.error(msg);
        }
      }
    } catch {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-400";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-gray-900/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Báo cáo tài liệu</h3>
              <p className="text-xs text-gray-400 truncate max-w-[220px]">{documentTitle}</p>
            </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">
                Lý do báo cáo <span className="text-red-500">*</span>
              </span>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors(prev => ({ ...prev, reason: undefined }));
                }}
                disabled={submitting}
                className={`${inputClass} ${errors.reason ? "!border-red-400" : ""}`}
              >
                <option value="" disabled>Chọn lý do</option>
                {REPORT_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.reason && <p className="text-xs font-medium text-red-500">{errors.reason}</p>}
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">
                Mô tả chi tiết {reason === "OTHER" && <span className="text-red-500">*</span>}
              </span>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors(prev => ({ ...prev, description: undefined }));
                }}
                rows={3}
                disabled={submitting}
                placeholder="Mô tả vấn đề bạn gặp phải với tài liệu này..."
                className={`${inputClass} resize-none ${errors.description ? "!border-red-400" : ""}`}
              />
              {errors.description && <p className="text-xs font-medium text-red-500">{errors.description}</p>}
            </label>
          </div>

          <div className="flex gap-3 border-t border-gray-100 px-6 py-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-400 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang gửi...
                </>
              ) : (
                "Gửi báo cáo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
