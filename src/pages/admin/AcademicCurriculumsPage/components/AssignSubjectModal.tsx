import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Check } from "lucide-react";
import { Subject, AssignFormErrors } from "../types";

interface AssignSubjectModalProps {
  open: boolean;
  onClose: () => void;
  allSubjects: Subject[];
  defaultYear: number;
  defaultSemester: number;
  onAssign: (mapping: {
    studyYearNo: number;
    semesterNo: number;
    subjectId: number;
    isRequired: boolean;
    recommendedOrder?: number;
  }) => Promise<boolean>;
}

export function AssignSubjectModal({
  open,
  onClose,
  allSubjects,
  defaultYear,
  defaultSemester,
  onAssign,
}: AssignSubjectModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [isRequired, setIsRequired] = useState(true);
  const [recommendedOrder, setRecommendedOrder] = useState<number>(1);
  
  const [formErrors, setFormErrors] = useState<AssignFormErrors>({});
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
    setSelectedSubjectId("");
    setYear(defaultYear);
    setSemester(defaultSemester);
    setIsRequired(true);
    setRecommendedOrder(1);
    setFormErrors({});
  }, [open, defaultYear, defaultSemester]);

  const validateForm = () => {
    const errors: AssignFormErrors = {};
    if (!selectedSubjectId) {
      errors.subjectId = "Vui lòng chọn môn học để gán";
    }
    if (recommendedOrder < 1) {
      errors.recommendedOrder = "Thứ tự đề xuất phải lớn hơn hoặc bằng 1";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const success = await onAssign({
        subjectId: Number(selectedSubjectId),
        studyYearNo: year,
        semesterNo: semester,
        isRequired,
        recommendedOrder: Number(recommendedOrder),
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
      aria-label="Gán Môn học vào Kỳ"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">Gán Môn học vào Học kỳ</h3>
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
            {/* Subject Selector */}
            <div>
              <label
                htmlFor="assign-subject"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Môn học
              </label>
              <select
                id="assign-subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : "")}
                disabled={submitting}
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none focus:bg-white disabled:opacity-60 ${
                  formErrors.subjectId
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              >
                <option value="">-- Chọn môn học --</option>
                {allSubjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    [{sub.subjectCode}] {sub.subjectName}
                  </option>
                ))}
              </select>
              {formErrors.subjectId && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">
                  {formErrors.subjectId}
                </span>
              )}
            </div>

            {/* Grid for Year and Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="assign-year"
                  className="text-xs font-semibold uppercase tracking-wider text-sand-500"
                >
                  Năm học
                </label>
                <select
                  id="assign-year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  disabled={submitting}
                  className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
                >
                  <option value={1}>Năm 1</option>
                  <option value={2}>Năm 2</option>
                  <option value={3}>Năm 3</option>
                  <option value={4}>Năm 4</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="assign-semester"
                  className="text-xs font-semibold uppercase tracking-wider text-sand-500"
                >
                  Học kỳ
                </label>
                <select
                  id="assign-semester"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  disabled={submitting}
                  className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                  <option value={3}>Học kỳ 3</option>
                </select>
              </div>
            </div>

            {/* Recommended Order */}
            <div>
              <label
                htmlFor="recommended-order"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Thứ tự đề xuất (recommendedOrder)
              </label>
              <input
                id="recommended-order"
                type="number"
                min={1}
                value={recommendedOrder}
                onChange={(e) => setRecommendedOrder(Number(e.target.value))}
                disabled={submitting}
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:bg-white focus:border-[#3b82f6]"
              />
            </div>

            {/* Is Required Checkbox */}
            <div className="flex items-center gap-2.5 pt-2">
              <label className="relative flex cursor-pointer items-center rounded-full p-1" htmlFor="checkbox-required">
                <input
                  type="checkbox"
                  id="checkbox-required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  disabled={submitting}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-sand-300 bg-sand-50/50 checked:border-[#3b82f6] checked:bg-[#3b82f6] transition-all"
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <Check size={12} strokeWidth={3} />
                </span>
              </label>
              <label
                htmlFor="checkbox-required"
                className="text-xs font-semibold uppercase tracking-wider text-sand-600 cursor-pointer select-none"
              >
                Môn học bắt buộc
              </label>
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
              <span>Gán môn học</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
