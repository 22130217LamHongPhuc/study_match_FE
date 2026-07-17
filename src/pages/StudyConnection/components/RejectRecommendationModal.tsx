import { FormEvent, useEffect, useState } from "react";

const OTHER_REASON_VALUE = "other";

const REJECTION_REASONS = [
  {
    value: "schedule_conflict",
    label: "Không trùng thời gian rảnh",
  },
  {
    value: "subject_mismatch",
    label: "Không cùng môn/chủ đề học",
  },
  {
    value: "goal_mismatch",
    label: "Mục tiêu học tập không phù hợp",
  },
  {
    value: "level_mismatch",
    label: "Trình độ học tập chưa phù hợp",
  },
  {
    value: "skill_mismatch",
    label: "Kỹ năng chưa phù hợp",
  },
  {
    value: "style_mismatch",
    label: "Phong cách học không phù hợp",
  },
  {
    value: "format_mismatch",
    label: "Hình thức học không phù hợp",
  },
  {
    value: "location_mismatch",
    label: "Khu vực học không thuận tiện",
  },
  {
    value: "profile_missing_info",
    label: "Hồ sơ chưa đủ thông tin",
  },
  {
    value: "not_interested",
    label: "Không quan tâm gợi ý này",
  },
  {
    value: OTHER_REASON_VALUE,
    label: "Lý do khác",
  },
];

export interface RejectRecommendationSubmitValue {
  selectedReasons: string[];
  note: string;
}

interface RejectRecommendationModalProps {
  open: boolean;
  recommendationName?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (
    value: RejectRecommendationSubmitValue,
  ) => Promise<void> | void;
}

export default function RejectRecommendationModal({
  open,
  recommendationName,
  submitting = false,
  onClose,
  onSubmit,
}: RejectRecommendationModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setSelectedReasons([]);
    setNote("");
    setError("");
  }, [open, recommendationName]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  const hasOtherReason = selectedReasons.includes(OTHER_REASON_VALUE);

  const toggleReason = (value: string) => {
    setError("");
    setSelectedReasons((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedReasons.length === 0) {
      setError("Hãy chọn ít nhất một lý do để StudyMatch hiểu bạn hơn.");
      return;
    }

    const trimmedNote = note.trim();

    if (hasOtherReason && !trimmedNote) {
      setError("Vui lòng thêm ghi chú cho mục Lý do khác.");
      return;
    }

    setError("");

    const selectedReasonLabels = REJECTION_REASONS.filter((reason) =>
      selectedReasons.includes(reason.value),
    ).map((reason) => reason.label);

    await onSubmit({
      selectedReasons: selectedReasonLabels,
      note: trimmedNote,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Đóng"
        disabled={submitting}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-sage-50 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-600">
                Phản hồi gợi ý
              </div>
              <h3 className="mt-2 text-lg font-bold text-gray-900">
                Vì sao bạn chưa muốn kết nối với bạn học này?
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                {recommendationName
                  ? `Phản hồi của bạn về ${recommendationName} sẽ giúp các gợi ý sau sát hơn với nhu cầu học tập.`
                  : "Phản hồi của bạn sẽ giúp các gợi ý sau sát hơn với nhu cầu học tập."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3.5 py-2 text-xs text-blue-700 font-medium">
              Bạn có thể chọn nhiều lý do để phản hồi chính xác hơn.
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {REJECTION_REASONS.map((reason) => {
                const checked = selectedReasons.includes(reason.value);

                return (
                  <label
                    key={reason.value}
                    className={`group flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all ${checked
                      ? "border-blue-300 bg-blue-50 shadow-[0_4px_12px_rgba(37, 99, 235,0.06)]"
                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleReason(reason.value)}
                      className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-300 cursor-pointer"
                    />
                    <span className="text-xs font-semibold leading-5 text-gray-700">
                      {reason.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">
                    Ghi chú thêm
                  </h4>
                  <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                    Bạn có thể chia sẻ chi tiết hơn để hệ thống gợi ý tốt hơn cho lần sau.
                  </p>
                </div>
                <div className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm">
                  {selectedReasons.length} lý do
                </div>
              </div>

              <textarea
                value={note}
                onChange={(event) => {
                  setError("");
                  setNote(event.target.value);
                }}
                rows={3}
                placeholder="Ví dụ: Mình đang ưu tiên bạn học cùng ca tối và có cùng mục tiêu ôn thi giữa kỳ."
                className="mt-3 w-[70%] resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs leading-5 text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-500 px-5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300 cursor-pointer"
            >
              {submitting ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
