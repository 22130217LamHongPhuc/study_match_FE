import { useEffect, type ReactNode } from "react";
import { BrainCircuit, X } from "lucide-react";
import type { StudyFeedbackResponse } from "../types";
import { RatingView } from "./RatingView";
import { formatDateTime, sessionTypeLabel } from "../utils";

type FeedbackDetailModalProps = {
  open: boolean;
  feedback: StudyFeedbackResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export function FeedbackDetailModal({
  open,
  feedback,
  loading,
  error,
  onClose,
}: FeedbackDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết phản hồi"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-sand-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-accent-50 text-accent-600">
              <BrainCircuit size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-sand-900">
                Chi tiết phản hồi{feedback ? ` #${feedback.id}` : ""}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-sand-500">
                {feedback ? `Session #${feedback.sessionId}` : "Đang tải dữ liệu"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-10 text-center text-sm font-medium text-sand-500">
              Đang tải chi tiết phản hồi...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && feedback && (
            <div className="space-y-4">
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Thông tin chung
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoRow label="ID Feedback" value={feedback.id} />
                  <InfoRow label="Session ID" value={feedback.sessionId} />
                  <InfoRow
                    label="Người đánh giá"
                    value={`User #${feedback.reviewerUserId}`}
                  />
                  <InfoRow
                    label="Người được đánh giá"
                    value={
                      feedback.targetUserId === null
                        ? "Không có"
                        : `User #${feedback.targetUserId}`
                    }
                  />
                  <InfoRow
                    label="Group ID"
                    value={feedback.groupId === null ? "Không có" : feedback.groupId}
                  />
                  <InfoRow
                    label="Loại phiên"
                    value={sessionTypeLabel[feedback.sessionType]}
                  />
                  <InfoRow label="Loại phản hồi" value={feedback.feedbackType} />
                  <InfoRow
                    label="Ngày tạo"
                    value={formatDateTime(feedback.createdAt)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Điểm đánh giá
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Rating"
                    value={<RatingView rating={feedback.rating} />}
                  />
                  <InfoRow
                    label="Điểm tương thích"
                    value={`${feedback.matchedQualityScore}/5`}
                  />
                  <InfoRow
                    label="Giao tiếp"
                    value={`${feedback.communicationScore}/5`}
                  />
                  <InfoRow
                    label="Hiệu quả học"
                    value={`${feedback.studyEffectivenessScore}/5`}
                  />
                  <InfoRow
                    label="Đưa vào mô hình"
                    value={<ModelBadge eligible={feedback.eligibleForModel} />}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-sand-200 bg-sand-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-sand-500">
                  Nhận xét
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-sand-700">
                  {feedback.comment || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="h-9 w-full rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-sand-500">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-sand-800">{value}</div>
      </div>
    </div>
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
