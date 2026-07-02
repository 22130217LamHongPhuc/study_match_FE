import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { LoadingSkeleton } from "../../../components/modal/basic/LoadingSkeleton";
import { forgetPassword } from "../../../services/AuthService";
import BackgroundLayer from "../components/BackgroundLayer";


export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgetPassword(email);

      if (res.success) {
        navigate("/check-email");
        return;
      } else {
        alert("Gửi yêu cầu thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f7f5f0] flex items-center justify-center px-4 overflow-hidden">
      <BackgroundLayer />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <Mail className="h-7 w-7 text-orange-600" />
            </div>

            <h1 className="text-center text-2xl font-bold text-slate-800">
              Quên mật khẩu?
            </h1>

            <p className="mt-3 text-center text-sm text-slate-500">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu
              cho bạn.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-orange-600 hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
