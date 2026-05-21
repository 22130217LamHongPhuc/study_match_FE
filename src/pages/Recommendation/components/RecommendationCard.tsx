import { RecommendationCardVm } from "../types";

interface RecommendationCardProps {
  recommendation: RecommendationCardVm;
  onConnect?: (id: number) => void;
  onReject?: (id: number) => void;
}

function getMatchStyle(match: number) {
  if (match >= 70) {
    return {
      text: "text-green-700",
      bar: "bg-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    };
  }

  if (match >= 50) {
    return {
      text: "text-blue-700",
      bar: "bg-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  }

  return {
    text: "text-yellow-700",
    bar: "bg-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  };
}

export default function RecommendationCard({
  recommendation,
  onConnect,
  onReject,
}: RecommendationCardProps) {
  const match = Number(recommendation.matchPercentage.toFixed(1));
  const safeMatch = Math.min(100, Math.max(0, match));
  const style = getMatchStyle(match);

  return (
    <article className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Mức độ phù hợp</p>

          <p className={`mt-1 text-xl font-semibold ${style.text}`}>{match}%</p>
        </div>

        <span
          className={`max-w-[160px] truncate rounded-md border px-2 py-1 text-xs font-medium ${style.bg} ${style.border} ${style.text}`}
          title={recommendation.studyModeLabel}
        >
          {recommendation.studyModeLabel}
        </span>
      </div>

      <div className="mb-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${style.bar}`}
            style={{ width: `${safeMatch}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <InfoChip label={`Khu vực: ${recommendation.region}`} />
        <InfoChip label={`Giới tính: ${recommendation.gender}`} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Metric label="Trình độ" value={recommendation.studyGoal} />
        <Metric label="Điểm TB" value={recommendation.avgScore.toFixed(2)} />
        <Metric label="Tín chỉ" value={recommendation.studiedCredits} />
        <Metric
          label="Môn chung"
          value={`${(recommendation.sharedSubjectScore * 100).toFixed(0)}%`}
        />
      </div>

      <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Môn học chung trong học kỳ</p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {recommendation.sharedSubjectCount} môn
        </p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onConnect?.(recommendation.userId)}
          className="h-9 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Kết nối
        </button>

        <button
          type="button"
          onClick={() => onReject?.(recommendation.userId)}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Từ chối
        </button>
      </div>
    </article>
  );
}

function InfoChip({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600">
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
