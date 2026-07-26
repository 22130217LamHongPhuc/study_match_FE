import React from "react";
import { Search } from "lucide-react";
import { Cohort } from "../../AcademicCohortsPage/types";

interface ProfileToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  cohortId: number | "";
  onCohortChange: (val: number | "") => void;
  cohorts: Cohort[];
}

export function ProfileToolbar({
  search,
  onSearchChange,
  cohortId,
  onCohortChange,
  cohorts,
}: ProfileToolbarProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-sand-900">Hồ sơ Học tập Sinh viên</h1>
        <p className="mt-0.5 text-sm text-sand-500">
          Quản lý và xem chi tiết hồ sơ học tập, lịch sử điểm số và dữ liệu enrollment của sinh viên.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..."
            className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50/50 pl-9 pr-3 text-sm text-sand-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white"
          />
        </div>

        {/* Cohort filter dropdown */}
        <select
          value={cohortId}
          onChange={(e) =>
            onCohortChange(e.target.value ? Number(e.target.value) : "")
          }
          className="h-9 w-full sm:w-48 rounded-lg border border-sand-300 bg-sand-50/50 px-3 text-sm text-sand-800 outline-none focus:border-[#3b82f6]"
        >
          <option value="">Tất cả khóa học</option>
          {cohorts.map((c) => (
            <option key={c.cohortId} value={c.cohortId}>
              Khóa {c.cohortCode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
