import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { Cohort, CohortFormErrors } from "../types";
import { Curriculum } from "../../AcademicCurriculumsPage/types";

interface AddEditCohortModalProps {
  open: boolean;
  onClose: () => void;
  editingCohort: Cohort | null;
  curriculums: Curriculum[];
  onSave: (payload: {
    cohortCode: string;
    startAcademicYear: number;
    totalStudyYears: number;
    curriculumId: number;
  }) => Promise<boolean>;
}

export function AddEditCohortModal({
  open,
  onClose,
  editingCohort,
  curriculums,
  onSave,
}: AddEditCohortModalProps) {
  const [code, setCode] = useState("");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [studyYears, setStudyYears] = useState<number>(4);
  const [curriculumId, setCurriculumId] = useState<number | "">("");

  const [formErrors, setFormErrors] = useState<CohortFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Generate years list for dropdown (e.g. from current year - 8 to current year + 4)
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 15 }, (_, i) => currentYear - 8 + i);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (editingCohort) {
      setCode(editingCohort.cohortCode);
      setStartYear(editingCohort.startAcademicYear);
      setStudyYears(editingCohort.totalStudyYears);
      setCurriculumId(editingCohort.curriculum?.curriculumId || "");
    } else {
      setCode("");
      setStartYear(new Date().getFullYear());
      setStudyYears(4);
      setCurriculumId("");
    }
    setFormErrors({});
  }, [editingCohort, open]);

  const validateForm = () => {
    const errors: CohortFormErrors = {};
    if (!code.trim()) {
      errors.code = "Tên khóa không được để trống";
    } else if (code.length < 2 || code.length > 20) {
      errors.code = "Tên khóa phải từ 2 đến 20 ký tự";
    }

    if (!curriculumId) {
      errors.curriculumId = "Vui lòng chọn chương trình đào tạo áp dụng";
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
        cohortCode: code.trim(),
        startAcademicYear: Number(startYear),
        totalStudyYears: Number(studyYears),
        curriculumId: Number(curriculumId),
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
      aria-label="Thêm/Sửa Khóa học"
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
            {editingCohort ? "Cập nhật Khóa học" : "Thêm Khóa học mới"}
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
            {/* Cohort Code */}
            <div>
              <label
                htmlFor="cohort-code"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Tên khóa (Cohort Code)
              </label>
              <input
                id="cohort-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={submitting}
                placeholder="Ví dụ: K48 hoặc 48"
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none transition-colors focus:bg-white disabled:opacity-60 ${
                  formErrors.code
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              />
              {formErrors.code && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">
                  {formErrors.code}
                </span>
              )}
            </div>

            {/* Start Year */}
            <div>
              <label
                htmlFor="cohort-start-year"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Năm học bắt đầu
              </label>
              <select
                id="cohort-start-year"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
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

            {/* Study Years */}
            <div>
              <label
                htmlFor="cohort-study-years"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Thời gian đào tạo (Năm)
              </label>
              <select
                id="cohort-study-years"
                value={studyYears}
                onChange={(e) => setStudyYears(Number(e.target.value))}
                disabled={submitting}
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
              >
                <option value={3}>3 năm (Cao đẳng)</option>
                <option value={4}>4 năm (Đại học thường)</option>
                <option value={5}>5 năm (Kỹ sư/Dược sĩ)</option>
              </select>
            </div>

            {/* Curriculum select */}
            <div>
              <label
                htmlFor="cohort-curriculum"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Chương trình đào tạo áp dụng
              </label>
              <select
                id="cohort-curriculum"
                value={curriculumId}
                onChange={(e) => setCurriculumId(e.target.value ? Number(e.target.value) : "")}
                disabled={submitting}
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none focus:bg-white disabled:opacity-60 ${
                  formErrors.curriculumId
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              >
                <option value="">-- Chọn chương trình --</option>
                {curriculums.map((curr) => (
                  <option key={curr.curriculumId} value={curr.curriculumId}>
                    {curr.curriculumName} ({curr.curriculumCode})
                  </option>
                ))}
              </select>
              {formErrors.curriculumId && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">
                  {formErrors.curriculumId}
                </span>
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
