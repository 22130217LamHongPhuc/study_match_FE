import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2, AlertCircle, CheckCircle, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { verifyAdminInvitation, activateAdmin } from "../../services/UserService";
import logoImg from "../../assets/img/logo.png";

export default function ActivateAdminPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [invalidMsg, setInvalidMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setInvalidMsg("Đường dẫn kích hoạt thiếu mã xác thực (token).");
      setVerifying(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await verifyAdminInvitation(token);
        if (res.success && res.data) {
          setEmail(res.data.email);
          setFullName(res.data.fullName);
        } else {
          setInvalidMsg(res.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
        }
      } catch {
        setInvalidMsg("Không thể kết nối đến máy chủ để xác thực.");
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

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

    if (!fullName.trim()) {
      toast.warning("Vui lòng nhập họ và tên.");
      return;
    }

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
      const res = await activateAdmin({
        token,
        fullName: fullName.trim(),
        password,
        confirmPassword,
      });

      if (res.success) {
        toast.success("Kích hoạt tài khoản quản trị thành công!");
        setSuccess(true);
      } else {
        toast.error(res.message || "Kích hoạt tài khoản thất bại.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
          <p className="text-sm font-semibold text-slate-600">Đang xác thực liên kết...</p>
        </div>
      </div>
    );
  }

  if (invalidMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
        <div className="w-full max-w-md rounded-xl border border-rose-100 bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center text-rose-500">
            <AlertCircle size={48} />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Liên kết không hợp lệ
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {invalidMsg}
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="mt-6 h-10 w-full rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 transition-all focus:outline-none"
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
        <div className="w-full max-w-md rounded-xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle size={48} />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            Kích hoạt thành công
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Tài khoản quản trị của bạn đã được thiết lập mật khẩu và kích hoạt thành công.
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
            Thiết lập mật khẩu Admin
          </h1>
          <div className="mt-3 rounded-lg bg-blue-50/60 p-3 text-xs text-left border border-blue-100/60">
            <p className="font-semibold text-slate-700">Kích hoạt tài khoản cho:</p>
            <p className="mt-0.5 font-bold text-slate-900">{fullName}</p>
            <p className="text-slate-500">{email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Họ và tên
            </label>
            <div className="relative mt-1">
              <UserRound
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                placeholder="Nhập họ và tên của bạn"
                required
              />
            </div>
          </div>

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
              Xác nhận mật khẩu
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
                placeholder="Nhập lại mật khẩu"
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
              "Hoàn tất thiết lập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
