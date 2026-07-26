import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { AcademicTerm, TermFormErrors } from "../types";

interface AddEditTermModalProps {
  open: boolean;
  onClose: () => void;
  editingTerm: AcademicTerm | null;
  onSave: (payload: {
    academicYearStart: number;
    academicYearEnd: number;
    semesterNo: number;
    fullName: string;
    status: string;
  }) => Promise<boolean>;
}

export function AddEditTermModal({
  open,
  onClose,
  editingTerm,
  onSave,
}: AddEditTermModalProps) {
  const [yearStart, setYearStart] = useState<number>(new Date().getFullYear());
  const [yearEnd, setYearEnd] = useState<number>(new Date().getFullYear() + 1);
  const [semesterNo, setSemesterNo] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("planned");

  const [formErrors, setFormErrors] = useState<TermFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Generate years list (current year - 5 to current year + 5)
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Handle default name helper when values change (only when adding new term)
  useEffect(() => {
    if (!editingTerm && open) {
      setFullName(`Học kỳ ${semesterNo} - Năm học ${yearStart}-${yearEnd}`);
    }
  }, [yearStart, yearEnd, semesterNo, editingTerm, open]);

  useEffect(() => {
    if (editingTerm) {
      setYearStart(editingTerm.academicYearStart);
      setYearEnd(editingTerm.academicYearEnd);
      setSemesterNo(editingTerm.semesterNo);
      setFullName(editingTerm.fullName);
      setStatus(editingTerm.status);
    } else {
      setYearStart(new Date().getFullYear());
      setYearEnd(new Date().getFullYear() + 1);
      setSemesterNo(1);
      setFullName(`Học kỳ 1 - Năm học ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
      setStatus("planned");
    }
    setFormErrors({});
  }, [editingTerm, open]);

  const validateForm = () => {
    const errors: TermFormErrors = {};
    if (yearStart >= yearEnd) {
      errors.academicYearEnd = "Năm học kết thúc phải lớn hơn năm bắt đầu";
    }
    if (!fullName.trim()) {
      errors.fullName = "Tên học kỳ không được để trống";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const success = await onSave({
        academicYearStart: Number(yearStart),
        academicYearEnd: Number(yearEnd),
        semesterNo: Number(semesterNo),
        fullName: fullName.trim(),
        status,
      });
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
      aria-label="Thêm/Sửa Học kỳ"
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
            {editingTerm ? "Cập nhật Học kỳ" : "Tạo Học kỳ mới"}
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
          {formErrors.academicYearEnd && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
              {formErrors.academicYearEnd}
            </div>
          )}

          <div className="space-y-3">
            {/* Grid for years */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="term-year-start"
                  className="text-xs font-semibold uppercase tracking-wider text-sand-500"
                >
                  Năm học bắt đầu
                </label>
                <select
                  id="term-year-start"
                  value={yearStart}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setYearStart(val);
                    setYearEnd(val + 1); // Set automatically to start + 1 for convenience
                  }}
                  disabled={submitting}
                  className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="term-year-end"
                  className="text-xs font-semibold uppercase tracking-wider text-sand-500"
                >
                  Năm học kết thúc
                </label>
                <select
                  id="term-year-end"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(Number(e.target.value))}
                  disabled={submitting}
                  className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester No */}
            <div>
              <label
                htmlFor="term-semester-no"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Học kỳ số
              </label>
              <select
                id="term-semester-no"
                value={semesterNo}
                onChange={(e) => setSemesterNo(Number(e.target.value))}
                disabled={submitting}
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
              >
                <option value={1}>Học kỳ 1</option>
                <option value={2}>Học kỳ 2</option>
                <option value={3}>Học kỳ 3</option>
              </select>
            </div>

            {/* Term Full Name */}
            <div>
              <label
                htmlFor="term-fullname"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Tên Học kỳ (Full Name)
              </label>
              <input
                id="term-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
                placeholder="Ví dụ: Học kỳ 1 - Năm học 2026-2027"
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none transition-colors focus:bg-white disabled:opacity-60 ${
                  formErrors.fullName
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              />
              {formErrors.fullName && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">
                  {formErrors.fullName}
                </span>
              )}
            </div>

            {/* Status (Only show when editing, default planned when creating) */}
            {editingTerm && (() => {
              const currentStatus = (editingTerm.status || "").toLowerCase();
              const isCompleted = currentStatus === "completed";
              const isActive = currentStatus === "active";

              return (
                <div>
                  <label
                    htmlFor="term-status"
                    className="text-xs font-semibold uppercase tracking-wider text-sand-500"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="term-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={submitting || isCompleted}
                    className={`mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6] ${
                      isCompleted ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <option value="completed">Đã kết thúc (Completed)</option>
                    ) : isActive ? (
                      <>
                        <option value="active">Đang hoạt động (Active)</option>
                        <option value="completed">Đã kết thúc (Completed)</option>
                      </>
                    ) : (
                      <>
                        <option value="planned">Dự kiến (Planned)</option>
                        <option value="completed">Đã kết thúc (Completed)</option>
                      </>
                    )}
                  </select>
                  {isCompleted && (
                    <span className="text-[11px] font-medium text-sand-400 mt-1 block">
                      Học kỳ đã kết thúc không thể thay đổi trạng thái
                    </span>
                  )}
                  {!isCompleted && !isActive && (
                    <span className="text-[11px] font-medium text-sand-400 mt-1 block">
                      Sử dụng nút "Kích hoạt kỳ" để đặt học kỳ hoạt động
                    </span>
                  )}
                </div>
              );
            })()}
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
