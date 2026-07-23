import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Loader2 } from "lucide-react";
import { changeAdminPassword } from "../../services/UserService";
import { toast } from "react-toastify";

type ChangeAdminPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ChangeAdminPasswordModal({
  open,
  onClose,
}: ChangeAdminPasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning("Vui lòng điền đầy đủ các thông tin");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Mật khẩu mới phải chứa ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const res = await changeAdminPassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast.success("Thay đổi mật khẩu thành công");
        onClose();
      } else {
        toast.error(res.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Đổi mật khẩu"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Đổi mật khẩu tài khoản
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-3.5">
            <div>
              <label
                htmlFor="oldPassword"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Mật khẩu hiện tại
              </label>
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Nhập mật khẩu hiện tại"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Mật khẩu mới
              </label>
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Xác nhận mật khẩu mới
              </label>
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
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
                  Đang đổi...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
