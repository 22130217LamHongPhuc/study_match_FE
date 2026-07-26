import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";

interface ActivateTermConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  termName: string;
}

export function ActivateTermConfirmModal({
  open,
  onClose,
  onConfirm,
  termName,
}: ActivateTermConfirmModalProps) {
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
      aria-label="Xác nhận kích hoạt học kỳ"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-sand-200 bg-white p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Play size={22} fill="currentColor" />
        </div>
        
        <h3 className="mt-4 text-base font-semibold text-sand-900">Kích hoạt Học kỳ Hiện tại</h3>
        <p className="mt-2 text-sm font-medium text-sand-600 leading-normal">
          Bạn có chắc chắn muốn đặt học kỳ <span className="font-bold text-sand-900">"{termName}"</span> làm Học kỳ hiện tại của hệ thống? Học kỳ đang hoạt động khác sẽ tự động được chuyển trạng thái thành Đã kết thúc.
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
            className="h-9 flex-1 rounded-lg bg-[#3b82f6] px-3 text-sm font-medium text-white transition-all hover:bg-[#2563eb] shadow-md shadow-[#3b82f6]/10"
          >
            Xác nhận kích hoạt
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
