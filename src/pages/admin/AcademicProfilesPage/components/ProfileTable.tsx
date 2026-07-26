import React from "react";
import { Eye, Edit, Users } from "lucide-react";
import { StudentProfile } from "../types";

interface ProfileTableProps {
  profiles: StudentProfile[];
  loading: boolean;
  onViewDetail: (profile: StudentProfile) => void;
  onEditClick: (profile: StudentProfile) => void;
}

export function ProfileTable({
  profiles,
  loading,
  onViewDetail,
  onEditClick,
}: ProfileTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-16">
                STT
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Mã sinh viên
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Họ và tên
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Khóa
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Khu vực
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
                Giới tính
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500 w-36 text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-sand-100 last:border-b-0 animate-pulse"
                >
                  <td className="px-4 py-3">
                    <div className="h-4 w-6 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-10 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 bg-sand-200 rounded" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                      <div className="h-7 w-7 bg-sand-100 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-sand-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users size={24} className="text-sand-400" />
                    <p className="font-semibold text-sand-800">
                      Không tìm thấy sinh viên nào
                    </p>
                    <p className="text-xs text-sand-500">
                      Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              profiles.map((profile, idx) => (
                <tr
                  key={profile.profileId}
                  className="border-b border-sand-100 last:border-b-0 hover:bg-sand-50/50"
                >
                  <td className="px-4 py-3 text-xs font-medium text-sand-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-sand-800">
                    {profile.studentCode}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-sand-800">
                    {profile.fullName || (
                      <span className="text-sand-400 italic">Chưa cập nhật</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {profile.cohort?.cohortCode || (
                      <span className="text-sand-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {profile.region || (
                      <span className="text-sand-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-sand-700">
                    {profile.gender || (
                      <span className="text-sand-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail(profile)}
                        className="rounded p-1.5 text-[#3b82f6] transition-colors hover:bg-blue-50 hover:text-[#2563eb]"
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditClick(profile)}
                        className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                        title="Hiệu chỉnh hồ sơ"
                      >
                        <Edit size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
