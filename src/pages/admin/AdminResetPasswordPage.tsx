import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { adminResetPassword } from "../../services/AuthService";
import logoImg from "../../assets/img/logo.png";

export default function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      toast.error("Không tìm thấy mã xác thực (token).");
      navigate("/admin/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!success) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/admin/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      toast.warning("Mật khẩu phải chứa ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const res = await adminResetPassword(token, password);

      if (res.success) {
        toast.success("Đặt lại mật khẩu thành công!");
        setSuccess(true);
      } else {
        toast.error(res.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
        <div className="w-full max-w-md rounded-xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle size={48} />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Kích hoạt mật khẩu mới thành công
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Mật khẩu quản trị viên của bạn đã được đặt lại thành công.
          </p>
          <p className="mt-4 text-xs font-semibold text-[#3b82f6]">
            Đang tự động chuyển hướng về trang đăng nhập sau {countdown} giây...
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="mt-6 h-10 w-full rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all focus:outline-none"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
      <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src={logoImg}
            alt="StudyMatch Logo"
            className="w-12 h-12 rounded-full object-cover border border-blue-50 shadow-sm"
          />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="text-[#3b82f6]" size={20} />
            Đặt lại mật khẩu Admin
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Vui lòng nhập mật khẩu mới để tiếp tục truy cập trang quản trị.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="pass"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Mật khẩu mới
            </label>
            <div className="relative mt-1">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                placeholder="Tối thiểu 8 ký tự"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPass"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Xác nhận mật khẩu mới
            </label>
            <div className="relative mt-1">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="confirmPass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 shadow-md shadow-[#3b82f6]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Hoàn tất đặt lại mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
