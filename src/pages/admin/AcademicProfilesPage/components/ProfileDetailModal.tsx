import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, BookOpen, MapPin, Calendar } from "lucide-react";
import { StudentProfile, StudentTermProfileDetail } from "../types";

interface ProfileDetailModalProps {
  open: boolean;
  onClose: () => void;
  profile: StudentProfile | null;
  termProfiles: StudentTermProfileDetail[];
  loadingTermProfiles: boolean;
}

export function ProfileDetailModal({
  open,
  onClose,
  profile,
  termProfiles,
  loadingTermProfiles,
}: ProfileDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !profile) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center px-4 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết hồ sơ sinh viên"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="fixed inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 my-4">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">
            Chi tiết Hồ sơ Sinh viên
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Student Info Grid */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sand-100 border border-sand-200 text-sand-500 overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={28} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-base font-bold text-sand-900 truncate">
                {profile.fullName || "Chưa cập nhật tên"}
              </h4>
              <p className="text-xs font-mono text-sand-500 mt-0.5">
                MSSV: {profile.studentCode}
              </p>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailItem
              icon={<BookOpen size={13} />}
              label="Khóa học"
              value={profile.cohort?.cohortCode ? `Khóa ${profile.cohort.cohortCode}` : "—"}
            />
            <DetailItem
              icon={<MapPin size={13} />}
              label="Khu vực"
              value={profile.region || "—"}
            />
            <DetailItem
              icon={<User size={13} />}
              label="Giới tính"
              value={profile.gender || "—"}
            />
            <DetailItem
              icon={<Calendar size={13} />}
              label="Nhóm tuổi"
              value={profile.ageGroup || "—"}
            />
          </div>

          {/* Term Profiles History */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-sand-500 mb-2">
              Lịch sử Học tập qua các Kỳ
            </h5>

            {loadingTermProfiles ? (
              <div className="py-6 text-center text-xs text-sand-400 animate-pulse">
                Đang tải dữ liệu lịch sử học tập...
              </div>
            ) : termProfiles.length === 0 ? (
              <div className="rounded-lg border border-sand-200 bg-sand-50/50 py-6 text-center text-xs text-sand-500">
                Chưa có dữ liệu lịch sử học tập.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-sand-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sand-50 border-b border-sand-200">
                      <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-sand-500">
                        Học kỳ
                      </th>
                      <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-sand-500 text-center">
                        GPA
                      </th>
                      <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-sand-500 text-center">
                        Tín chỉ
                      </th>
                      <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-sand-500">
                        Mục tiêu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {termProfiles.map((tp) => (
                      <tr
                        key={tp.id}
                        className="border-b border-sand-100 last:border-b-0"
                      >
                        <td className="px-3 py-2 text-xs text-sand-700">
                          {tp.term?.fullName || `Năm ${tp.studyYearNo} - Kỳ ${tp.semesterNo}`}
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-center">
                          {tp.avgScore != null ? (
                            <span
                              className={
                                Number(tp.avgScore) >= 3.2
                                  ? "text-green-700"
                                  : Number(tp.avgScore) >= 2.0
                                    ? "text-amber-700"
                                    : "text-rose-600"
                              }
                            >
                              {Number(tp.avgScore).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sand-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-sand-700 text-center font-mono">
                          {tp.studiedCredits ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-sand-600">
                          {tp.studyGoal || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-sand-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-full rounded-lg border border-sand-300 bg-white text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-sand-50/50 px-3 py-2.5">
      <span className="mt-0.5 text-sand-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-sand-400">
          {label}
        </p>
        <p className="text-xs font-semibold text-sand-800 truncate">{value}</p>
      </div>
    </div>
  );
}
