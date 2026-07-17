import { useState } from "react";
import { ProfileViewModel } from "../types";
import UpdateProfileDialog from "./UpdateProfileDialog";

interface ProfileHeaderCardProps {
  profile: ProfileViewModel;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "?";
}

function getGenderLabel(gender: string): string {
  const normalized = gender?.toLowerCase().trim();
  if (normalized === "male" || normalized === "nam" || normalized === "m") {
    return "Nam";
  }
  if (normalized === "female" || normalized === "nữ" || normalized === "nu" || normalized === "f") {
    return "Nữ";
  }
  return gender || "Chưa xác định";
}

export default function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const avatarUrl = localStorage.getItem("avatarUrl");
  const initials = getInitials(profile.fullName);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.fullName}
              className="h-16 w-16 rounded-full object-cover border-2 border-blue-100 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {initials}
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800">
              {profile.fullName}
            </h2>
            <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
              MSSV: {profile.studentCode}
            </p>
            <div className="text-xs text-gray-500 mt-1 flex flex-wrap justify-center sm:justify-start gap-x-2 gap-y-1">
              <span>Giới tính: <span className="font-medium text-gray-700">{getGenderLabel(profile.gender)}</span></span>
              <span>•</span>
              <span>Độ tuổi: <span className="font-medium text-gray-700">{profile.ageGroup}</span></span>
              <span>•</span>
              <span>Khu vực: <span className="font-medium text-gray-700">{profile.region}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-center sm:self-auto shrink-0">
          <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 border border-blue-100">
            {profile.cohortLabel}
          </span>

          <button
            type="button"
            onClick={() => setOpenEdit(true)}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition rounded-lg border border-gray-200 hover:border-blue-100 cursor-pointer"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>

      <UpdateProfileDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        profile={profile}
      />
    </div>
  );
}
