import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, UserRound, Loader2 } from "lucide-react";
import { inviteAdmin } from "../../../../services/UserService";
import { toast } from "react-toastify";

type InviteAdminModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function InviteAdminModal({
  open,
  onClose,
  onSuccess,
}: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setEmail("");
      setErrorMsg(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await inviteAdmin(email.trim());
      if (res.success) {
        toast.success(res.message || "Gửi lời mời thành công");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Gửi lời mời thất bại");
      }
    } catch {
      setErrorMsg("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Mời quản trị viên"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">
            Mời quản trị viên mới
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label
                htmlFor="invite-email"
                className="text-xs font-semibold uppercase tracking-wider text-sand-500"
              >
                Email
              </label>
              <div className="relative mt-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
                  size={16}
                />
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="an.nguyen@studymatch.vn"
                  className="h-10 w-full rounded-lg border border-sand-300 bg-sand-50/50 pl-10 pr-3 text-sm text-sand-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang mời...
                </>
              ) : (
                "Gửi lời mời"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
