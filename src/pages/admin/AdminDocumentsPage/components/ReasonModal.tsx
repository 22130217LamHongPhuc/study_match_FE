import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ReasonModalProps {
  type: "REJECT" | "HIDE";
  docTitle: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  reasonText: string;
  setReasonText: (val: string) => void;
  reasonError: string;
  setReasonError: (val: string) => void;
}

export default function ReasonModal({
  type,
  docTitle,
  onClose,
  onSubmit,
  reasonText,
  setReasonText,
  reasonError,
  setReasonError
}: ReasonModalProps) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-gray-900/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${type === "REJECT" ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-600"
              }`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {type === "REJECT" ? "Từ chối duyệt tài liệu" : "Ẩn tài liệu xuất bản"}
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[240px]">{docTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4">
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">
                Nhập lý do thực hiện <span className="text-red-500">*</span>
              </span>
              <textarea
                value={reasonText}
                onChange={e => {
                  setReasonText(e.target.value);
                  setReasonError("");
                }}
                rows={4}
                placeholder={type === "REJECT" ? "Lý do từ chối duyệt..." : "Lý do ẩn tài liệu..."}
                className={`w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none ${reasonError ? "border-red-400" : ""
                  }`}
              />
              {reasonError && <p className="text-xs font-semibold text-red-500">{reasonError}</p>}
            </label>
          </div>

          <div className="flex gap-3 border-t border-gray-100 px-6 py-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${type === "REJECT" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
