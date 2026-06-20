import { Eye, MessageSquare } from "lucide-react";
import type { StudyFeedbackResponse, StudySessionType } from "../types";
import { AI_MATCHING_PAGE_SIZE } from "../types";
import { RatingView } from "./RatingView";
import { formatDateTime, sessionTypeLabel } from "../utils";
import { Pagination } from "../../../../components/admin/Pagination";

const sessionTypeOptions: Array<{ label: string; value: StudySessionType | null }> = [
  { label: "Tất cả", value: null },
  { label: "Học 1-1", value: "USER_PAIR" },
  { label: "Học nhóm", value: "GROUP" },
];

const minRatingOptions: Array<{ label: string; value: number | null }> = [
  { label: "Tất cả", value: null },
  { label: "Từ 5 sao", value: 5 },
  { label: "Từ 4 sao", value: 4 },
  { label: "Từ 3 sao", value: 3 },
];

type StudyFeedbacksTableProps = {
  feedbacks: StudyFeedbackResponse[];
  page: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (feedback: StudyFeedbackResponse) => void;
  loading: boolean;
  sessionTypeFilter: StudySessionType | null;
  onSessionTypeFilterChange: (value: StudySessionType | null) => void;
  minRatingFilter: number | null;
  onMinRatingFilterChange: (value: number | null) => void;
  reviewerUserId: string;
  onReviewerUserIdChange: (value: string) => void;
  targetUserId: string;
  onTargetUserIdChange: (value: string) => void;
  groupId: string;
  onGroupIdChange: (value: string) => void;
};

export function StudyFeedbacksTable({
  feedbacks,
  page,
  totalItems,
  totalPages,
  onPageChange,
  onViewDetail,
  loading,
  sessionTypeFilter,
  onSessionTypeFilterChange,
  minRatingFilter,
  onMinRatingFilterChange,
  reviewerUserId,
  onReviewerUserIdChange,
  targetUserId,
  onTargetUserIdChange,
  groupId,
  onGroupIdChange,
}: StudyFeedbacksTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sand-200 bg-white p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <NumberFilter
              value={reviewerUserId}
              onChange={onReviewerUserIdChange}
              placeholder="Reviewer ID"
            />
            <NumberFilter
              value={targetUserId}
              onChange={onTargetUserIdChange}
              placeholder="Target ID"
            />
            <NumberFilter
              value={groupId}
              onChange={onGroupIdChange}
              placeholder="Group ID"
            />
          </div>

          <div className="flex flex-col gap-2.5 xl:flex-row xl:flex-wrap xl:items-center">
            <FilterButtonGroup
              label="Loại phiên"
              options={sessionTypeOptions}
              value={sessionTypeFilter}
              onChange={onSessionTypeFilterChange}
            />

            <div className="hidden h-4 w-px bg-sand-200 xl:block" />

            <FilterButtonGroup
              label="Điểm tối thiểu"
              options={minRatingOptions}
              value={minRatingFilter}
              onChange={onMinRatingFilterChange}
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-medium text-sand-800">
              Phản hồi học tập
            </h3>
            <p className="mt-0.5 text-xs font-medium text-sand-500">
              Danh sách đánh giá sau các phiên học
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-sand-100 bg-sand-50">
                <TableHeader>Người đánh giá</TableHeader>
                <TableHeader>Người được đánh giá</TableHeader>
                <TableHeader>Group</TableHeader>
                <TableHeader>Loại phiên</TableHeader>
                <TableHeader>Loại phản hồi</TableHeader>
                <TableHeader>Rating</TableHeader>
                <TableHeader>Tương thích</TableHeader>
                <TableHeader>Giao tiếp</TableHeader>
                <TableHeader>Hiệu quả học</TableHeader>
                <TableHeader>Mô hình</TableHeader>
                <TableHeader>Ngày tạo</TableHeader>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-sand-500">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={12} className="px-4 py-14 text-center">
                    <p className="text-sm font-medium text-sand-500">
                      Đang tải phản hồi học tập...
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                feedbacks.map((feedback) => (
                  <tr
                    key={feedback.id}
                    className="border-b border-sand-100 transition-colors last:border-0 hover:bg-sand-50/50"
                  >
                    <td className="px-4 py-3">
                      <UserText userId={feedback.reviewerUserId} />
                    </td>
                    <td className="px-4 py-3">
                      <UserText userId={feedback.targetUserId} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-700">
                        {feedback.groupId === null ? "-" : `#${feedback.groupId}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-700">
                        {sessionTypeLabel[feedback.sessionType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {feedback.feedbackType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RatingView rating={feedback.rating} />
                    </td>
                    <ScoreCell value={feedback.matchedQualityScore} />
                    <ScoreCell value={feedback.communicationScore} />
                    <ScoreCell value={feedback.studyEffectivenessScore} />
                    <td className="px-4 py-3">
                      <ModelBadge eligible={feedback.eligibleForModel} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-sand-600">
                        {formatDateTime(feedback.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onViewDetail(feedback)}
                          className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                          aria-label="Xem chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && feedbacks.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                        <MessageSquare size={22} className="text-sand-400" />
                      </div>
                      <p className="text-sm font-medium text-sand-600">
                        Không có phản hồi nào
                      </p>
                      <p className="text-xs text-sand-400">
                        Thử thay đổi bộ lọc hoặc khoảng thời gian.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={AI_MATCHING_PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function NumberFilter({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      min="1"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20 sm:w-36"
      placeholder={placeholder}
    />
  );
}

function FilterButtonGroup<T extends string | number | null>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-sand-400">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value ?? "all"}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
              value === option.value
                ? "border-sand-800 bg-sand-900 text-white"
                : "border-sand-300 bg-white text-sand-600 hover:bg-sand-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-sand-500">
      {children}
    </th>
  );
}

function UserText({ userId }: { userId: number | null }) {
  return (
    <span className="text-xs font-medium text-sand-700">
      {userId === null ? "-" : `User #${userId}`}
    </span>
  );
}

function ScoreCell({ value }: { value: number }) {
  return (
    <td className="px-4 py-3">
      <span className="text-xs font-semibold text-sand-700">{value}/5</span>
    </td>
  );
}

function ModelBadge({ eligible }: { eligible: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        eligible ? "bg-sage-50 text-sage-700" : "bg-sand-100 text-sand-600"
      }`}
    >
      {eligible ? "Có" : "Không"}
    </span>
  );
}
