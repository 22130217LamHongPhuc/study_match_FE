import { ProfileViewModel } from "../types";

interface AcademicInfoCardProps {
  profile: ProfileViewModel;
}

function MetricItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-gray-400">
        {label}
      </span>
      <span className="block text-sm font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}

export default function AcademicInfoCard({ profile }: AcademicInfoCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-gray-800">Thông tin học tập</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <MetricItem label="Học kỳ hiện tại" value={profile.termLabel} />
        </div>
        <MetricItem label="Năm học" value={`Năm ${profile.studyYearNo}`} />
        <MetricItem label="Học kỳ thứ" value={profile.semesterNo} />
        <MetricItem label="Điểm trung bình (GPA)" value={profile.avgScore.toFixed(2)} />
        <MetricItem label="Tín chỉ tích lũy" value={`${profile.studiedCredits} tín chỉ`} />
        <MetricItem label="Trình độ / Mục tiêu" value={profile.studyGoal} />
        <MetricItem label="Chế độ học" value={profile.studyModeLabel} />
      </div>
    </div>
  );
}
