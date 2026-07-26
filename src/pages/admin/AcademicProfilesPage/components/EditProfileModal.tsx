import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { StudentProfile, ProfileFormErrors } from "../types";
import { Cohort } from "../../AcademicCohortsPage/types";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
  cohorts: Cohort[];
  onSave: (payload: {
    cohortId?: number;
    studentCode?: string;
    fullName?: string;
    region?: string;
    gender?: string;
  }) => Promise<boolean>;
}

export function EditProfileModal({
  open,
  onClose,
  profile,
  cohorts,
  onSave,
}: EditProfileModalProps) {
  const [studentCode, setStudentCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [gender, setGender] = useState("");
  const [cohortId, setCohortId] = useState<number | "">("");

  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
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
    if (profile) {
      setStudentCode(profile.studentCode || "");
      setFullName(profile.fullName || "");
      setRegion(profile.region || "");
      setGender(profile.gender || "");
      setCohortId(profile.cohort?.cohortId || "");
    }
    setFormErrors({});
  }, [profile, open]);

  const validateForm = () => {
    const errors: ProfileFormErrors = {};
    if (!studentCode.trim()) {
      errors.studentCode = "Mã sinh viên không được để trống";
    }
    if (!fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống";
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
        studentCode: studentCode.trim(),
        fullName: fullName.trim(),
        region: region.trim() || undefined,
        gender: gender.trim() || undefined,
        cohortId: cohortId ? Number(cohortId) : undefined,
      });
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !profile) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Hiệu chỉnh hồ sơ sinh viên"
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
            Hiệu chỉnh Hồ sơ Sinh viên
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
            {/* Student Code */}
            <div>
              <label
                htmlFor="profile-student-code"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Mã sinh viên (MSSV)
              </label>
              <input
                id="profile-student-code"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                disabled={submitting}
                className={`mt-1 h-10 w-full rounded-lg border px-3 text-sm text-sand-800 outline-none transition-colors focus:bg-white disabled:opacity-60 ${
                  formErrors.studentCode
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-sand-300 bg-sand-50/50 focus:border-[#3b82f6]"
                }`}
              />
              {formErrors.studentCode && (
                <span className="text-[11px] font-medium text-rose-500 mt-1 block">
                  {formErrors.studentCode}
                </span>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="profile-fullname"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Họ và tên
              </label>
              <input
                id="profile-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
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

            {/* Cohort */}
            <div>
              <label
                htmlFor="profile-cohort"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Khóa học
              </label>
              <select
                id="profile-cohort"
                value={cohortId}
                onChange={(e) =>
                  setCohortId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={submitting}
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
              >
                <option value="">-- Chưa phân khóa --</option>
                {cohorts.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    Khóa {c.cohortCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="profile-region"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Khu vực
              </label>
              <input
                id="profile-region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={submitting}
                placeholder="Ví dụ: Miền Nam"
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="profile-gender"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Giới tính
              </label>
              <select
                id="profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={submitting}
                className="mt-1 h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
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
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
