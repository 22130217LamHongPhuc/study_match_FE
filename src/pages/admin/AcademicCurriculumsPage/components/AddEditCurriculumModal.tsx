import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { Curriculum, CurriculumFormErrors } from "../types";

interface AddEditCurriculumModalProps {
  open: boolean;
  onClose: () => void;
  editingCurriculum: Curriculum | null;
  onSave: (code: string, name: string) => Promise<boolean>;
}

export function AddEditCurriculumModal({
  open,
  onClose,
  editingCurriculum,
  onSave,
}: AddEditCurriculumModalProps) {
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formErrors, setFormErrors] = useState<CurriculumFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (editingCurriculum) {
      setFormCode(editingCurriculum.curriculumCode);
      setFormName(editingCurriculum.curriculumName);
    } else {
      setFormCode("");
      setFormName("");
    }
    setFormErrors({});
  }, [editingCurriculum, open]);

  const validateForm = () => {
    const errors: CurriculumFormErrors = {};
    if (!formCode.trim()) {
      errors.code = "Mã chương trình không được để trống";
    } else if (formCode.length < 2 || formCode.length > 20) {
      errors.code = "Mã chương trình phải từ 2 đến 20 ký tự";
    }

    if (!formName.trim()) {
      errors.name = "Tên chương trình không được để trống";
    } else if (formName.length < 2 || formName.length > 150) {
      errors.name = "Tên chương trình phải từ 2 đến 150 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const success = await onSave(formCode.trim(), formName.trim());
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Thêm/Sửa Chương trình học"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">
            {editingCurriculum ? "Cập nhật Chương trình" : "Thêm Chương trình mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="curriculum-code"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Mã Chương trình
              </label>
              <input
                id="curriculum-code"
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={submitting}
                placeholder="Ví dụ: K48CNTT"
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none transition-colors focus:bg-white disabled:opacity-60 ${
                  formErrors.code
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              />
              {formErrors.code && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">{formErrors.code}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="curriculum-name"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Tên Chương trình
              </label>
              <input
                id="curriculum-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={submitting}
                placeholder="Ví dụ: Công nghệ thông tin K48"
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none transition-colors focus:bg-white disabled:opacity-60 ${
                  formErrors.name
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              />
              {formErrors.name && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">{formErrors.name}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10 disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>Lưu lại</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
