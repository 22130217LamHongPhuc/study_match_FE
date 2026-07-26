import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";

interface ImportSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (list: any[]) => Promise<boolean>;
}

export function ImportSubjectModal({ open, onClose, onImport }: ImportSubjectModalProps) {
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setImportText("");
      setImportError(null);
    }
  }, [open]);

  const handleImportClick = async () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError("Vui lòng dán dữ liệu JSON môn học");
      return;
    }

    let parsedList = [];
    try {
      parsedList = JSON.parse(importText);
      if (!Array.isArray(parsedList)) {
        throw new Error("Dữ liệu JSON phải là một mảng đối tượng");
      }
      for (const item of parsedList) {
        if (!item.subjectCode || !item.subjectName) {
          throw new Error("Mỗi đối tượng môn học phải có mã (subjectCode) và tên (subjectName)");
        }
      }
    } catch (err: any) {
      setImportError(err.message || "JSON không hợp lệ, vui lòng kiểm tra lại");
      return;
    }

    try {
      setImporting(true);
      const success = await onImport(parsedList);
      if (success) {
        onClose();
      }
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Import danh sách Môn học"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={importing ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">Import danh sách Môn học</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-800">
            <p className="font-bold">Định dạng JSON yêu cầu:</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-slate-900 p-2.5 font-mono text-[10px] text-slate-200 leading-normal">
{`[
  { "subjectCode": "MATH101", "subjectName": "Toán cao cấp A1" },
  { "subjectCode": "PHY102", "subjectName": "Vật lý đại cương 1" }
]`}
            </pre>
            <p className="mt-2 text-[10px] text-slate-500">
              * Hệ thống sẽ tự động đối chiếu mã môn học. Nếu mã đã tồn tại, tên môn học sẽ được cập nhật mới.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-sand-500">
              Chuỗi dữ liệu JSON
            </label>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              disabled={importing}
              placeholder="Dán chuỗi mảng JSON môn học vào đây..."
              className="w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 py-2 text-xs font-mono text-sand-800 placeholder-sand-400 outline-none focus:border-[#3b82f6] focus:bg-white disabled:opacity-60 transition-colors"
            />
          </div>

          {importError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
              {importError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="h-10 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              disabled={importing}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10 disabled:opacity-50"
            >
              {importing && <Loader2 size={16} className="animate-spin" />}
              <span>Xác nhận import</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
