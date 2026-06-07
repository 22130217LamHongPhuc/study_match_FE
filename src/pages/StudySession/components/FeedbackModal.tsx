import type {
  FeedbackEligibilityResponse,
  FeedbackType,
  SubmitStudyFeedbackRequest,
} from "../types";

import { submitStudyFeedback } from "../../../services/StudySessionService";

import { type FormEvent, useState } from "react";

function getFeedbackTitle(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") return "Đánh giá buổi học";
  if (type === "REPORT_PROBLEM") return "Báo sự cố";
  if (type === "EARLY_LEAVE_REASON") return "Lý do rời sớm";
  return "Phản hồi ngắn";
}

function getFeedbackHint(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") {
    return "Chia sẻ cảm nhận của bạn để cải thiện chất lượng ghép học.";
  }

  if (type === "REPORT_PROBLEM") {
    return "Ghi nhận vấn đề khiến bạn không thể tham gia buổi học.";
  }

  if (type === "EARLY_LEAVE_REASON") {
    return "Cho biết lý do bạn rời sớm để hệ thống xử lý attendance chính xác hơn.";
  }

  return "Gửi phản hồi ngắn cho phần thời gian bạn đã tham gia.";
}

function getFeedbackPlaceholder(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") {
    return "Bạn học cùng đúng giờ, trao đổi rõ ràng, phần học hiệu quả...";
  }

  if (type === "REPORT_PROBLEM") {
    return "Mô tả sự cố bạn gặp phải trong buổi học";
  }

  if (type === "EARLY_LEAVE_REASON") {
    return "Bổ sung thêm lý do nếu cần";
  }

  return "Phản hồi nhanh về phần bạn đã tham gia";
}

function getReasonLabel(reason: string) {
  if (reason === "network") return "Mất kết nối";
  if (reason === "schedule") return "Có việc đột xuất";
  if (reason === "technical") return "Lỗi kỹ thuật";
  if (reason === "other") return "Lý do khác";
  return "";
}

export default function FeedbackSubmitPanel({
  eligibility,
}: {
  eligibility: FeedbackEligibilityResponse;
}) {
  const type = eligibility.feedbackType;
  const [rating, setRating] = useState(5);
  const [matchedQualityScore, setMatchedQualityScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [studyEffectivenessScore, setStudyEffectivenessScore] = useState(5);
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!type) return null;

  const isFullFeedback = type === "SESSION_FEEDBACK";
  const isPartialFeedback = type === "PARTIAL_FEEDBACK";
  const canRate = isFullFeedback || isPartialFeedback;
  const durationMinutes = Math.round(eligibility.totalDurationSeconds / 60);
  const requiredMinutes = Math.round(
    eligibility.minRequiredDurationSeconds / 60,
  );

  const buildContent = () => {
    const trimmedContent = content.trim();

    if (type !== "EARLY_LEAVE_REASON") {
      return trimmedContent;
    }

    const reasonLabel = getReasonLabel(reason);

    return [reasonLabel ? `Lý do: ${reasonLabel}` : "", trimmedContent]
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eligibility.canSubmitFeedback || submitted) return;

    const feedbackContent = buildContent();

    if (type === "EARLY_LEAVE_REASON" && !reason) {
      setSubmitError("Vui lòng chọn lý do rời sớm");
      return;
    }

    if (!feedbackContent) {
      setSubmitError("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const payload: SubmitStudyFeedbackRequest = {
      sessionId: eligibility.sessionId,
      userId: eligibility.userId,
      targetUserId: eligibility.targetUserId,
      groupId: eligibility.groupId,
      sessionType: eligibility.sessionType,
      feedbackType: type,
      content: feedbackContent,
      eligibleForModel: eligibility.eligibleForModel,
      ...(canRate ? { rating } : {}),
      ...(isFullFeedback
        ? {
            matchedQualityScore,
            communicationScore,
            studyEffectivenessScore,
          }
        : {}),
      ...(isPartialFeedback ? { studyEffectivenessScore } : {}),
    };

    try {
      setSubmitting(true);
      setSubmitError("");
      await submitStudyFeedback(payload);
      setSubmitted(true);
    } catch {
      setSubmitError("Không thể gửi feedback. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-orange-200 bg-orange-50/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-gray-800">
            {getFeedbackTitle(type)}
          </div>
          <div className="mt-1 text-xs font-medium leading-5 text-gray-500">
            {getFeedbackHint(type)}
          </div>
        </div>
        {eligibility.eligibleForModel && (
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            AI model
          </span>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-gray-500">
        Thời lượng tham gia: {durationMinutes} / {requiredMinutes} phút
      </div>

      {!eligibility.canSubmitFeedback ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-500">
          Hiện tại bạn chưa thể gửi feedback cho buổi học này.
        </div>
      ) : submitted ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Feedback của bạn đã được gửi thành công.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {canRate && (
            <RatingPicker
              label={
                isFullFeedback
                  ? "Mức độ hài lòng chung"
                  : "Đánh giá phần đã tham gia"
              }
              value={rating}
              onChange={setRating}
            />
          )}

          {isFullFeedback && (
            <div className="grid grid-cols-1 gap-3">
              <ScoreRow
                label="Chất lượng ghép học"
                value={matchedQualityScore}
                onChange={setMatchedQualityScore}
              />
              <ScoreRow
                label="Giao tiếp"
                value={communicationScore}
                onChange={setCommunicationScore}
              />
              <ScoreRow
                label="Hiệu quả học"
                value={studyEffectivenessScore}
                onChange={setStudyEffectivenessScore}
              />
            </div>
          )}

          {isPartialFeedback && (
            <ScoreRow
              label="Hiệu quả phần đã học"
              value={studyEffectivenessScore}
              onChange={setStudyEffectivenessScore}
            />
          )}

          {type === "EARLY_LEAVE_REASON" && (
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-orange-400"
            >
              <option value="">Chọn lý do rời sớm</option>
              <option value="network">Mất kết nối</option>
              <option value="schedule">Có việc đột xuất</option>
              <option value="technical">Lỗi kỹ thuật</option>
              <option value="other">Lý do khác</option>
            </select>
          )}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={isFullFeedback ? 4 : 3}
            className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-400"
            placeholder={getFeedbackPlaceholder(type)}
          />

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi feedback"}
          </button>
        </div>
      )}
    </form>
  );
}

function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-gray-500">{label}</div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`h-9 rounded-lg border text-sm font-bold transition-colors ${
              value === score
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-orange-100 bg-white text-gray-600 hover:border-orange-300"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
          {value}/5
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-orange-500"
      />
    </div>
  );
}
