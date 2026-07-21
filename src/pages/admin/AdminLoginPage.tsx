import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { adminLogin } from "../../services/AuthService";
import logoImg from "../../assets/img/logo.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const msg = localStorage.getItem("session_locked_message");
    if (msg) {
      toast.error(msg);
      localStorage.removeItem("session_locked_message");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning("Vui lòng điền đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await adminLogin(email.trim(), password);

      if (!response.success) {
        console.error("Admin login API error response:", response);
        setErrorMsg(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
        toast.error(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userId", response.data.userId.toString());
      localStorage.setItem("isAdmin", "true");
      navigate("/admin/overview");
    } catch (error) {
      console.error("Admin login exception:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("isAdmin");
      setErrorMsg("Có lỗi xảy ra trong quá trình đăng nhập");
      toast.error("Có lỗi xảy ra trong quá trình đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/80 font-sans p-4">
      <div className="w-full max-w-md rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src={logoImg}
            alt="StudyMatch Logo"
            className="w-12 h-12 rounded-full object-cover border border-blue-50 shadow-sm"
          />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            StudyMatch Admin
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Quản trị học tập thông minh
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {errorMsg && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Email quản trị
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white focus:ring-1 focus:ring-[#3b82f6]/20 disabled:opacity-60"
                  placeholder="admin@studymatch.vn"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                Mật khẩu
              </label>
              <div className="relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white focus:ring-1 focus:ring-[#3b82f6]/20 disabled:opacity-60"
                  placeholder="••••••••"
                  required
                />
              </div>
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
                Đang xác thực...
              </>
            ) : (
              "Đăng nhập hệ thống"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
