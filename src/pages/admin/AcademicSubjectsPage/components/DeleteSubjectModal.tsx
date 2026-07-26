import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface DeleteSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSubjectModal({ open, onClose, onConfirm }: DeleteSubjectModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Xác nhận xóa môn học"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-white p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-base font-semibold text-sand-900">Xác nhận xóa môn học</h3>
        <p className="mt-1 text-sm font-medium text-sand-600">
          Bạn có chắc chắn muốn xóa môn học này khỏi hệ thống? Thao tác này sẽ không thể khôi phục lại.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 flex-1 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white transition-all hover:bg-rose-700 shadow-md shadow-rose-600/10"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
