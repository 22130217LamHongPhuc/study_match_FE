import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { CommunityGroup } from "./CommunityGroupCard";

interface JoinGroupRequestModalProps {
  group: CommunityGroup | null;
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export default function JoinGroupRequestModal({
  group,
  open,
  submitting = false,
  onClose,
  onSubmit,
}: JoinGroupRequestModalProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setMessage("");
    }
  }, [open, group?.id]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, submitting]);

  if (!open || !group || typeof document === "undefined") return null;

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0 && !submitting;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmedMessage);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-group-request-title"
        className="w-full max-w-[480px] overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            <h2 id="join-group-request-title" className="text-lg font-bold leading-6 text-gray-900">
              Yêu cầu tham gia nhóm
            </h2>
            <p className="mt-1 truncate text-sm font-medium text-gray-500">{group.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <label htmlFor="join-group-message" className="text-sm font-semibold text-gray-800">
            Tại sao bạn lại tham gia nhóm?
          </label>
          <textarea
            id="join-group-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={submitting}
            rows={5}
            maxLength={500}
            placeholder="Ví dụ: Mình muốn học cùng các bạn để cải thiện môn này và trao đổi bài tập thường xuyên."
            className="mt-3 block min-h-[132px] w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">

            <span className="shrink-0 tabular-nums">{message.length}/500</span>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white"
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
