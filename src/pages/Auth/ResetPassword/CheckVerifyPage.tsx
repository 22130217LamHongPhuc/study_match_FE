import { MailCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { resetEmailVerification } from "../../../services/AuthService";
import { useState } from "react";
import { LoadingSkeleton } from "../../../components/modal/basic/LoadingSkeleton";
import BackgroundLayer from "../components/BackgroundLayer";


export default function CheckVerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!email) {
      alert("Email không hợp lệ. Vui lòng thử lại.");
      return;
    }
    setLoading(true);
    const res = await resetEmailVerification(email || "");

    if (res.success) {
      alert(
        "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.",
      );
    } else {
      alert(
        "Gửi lại email xác thực thất bại: " +
          (res.message || "Lỗi không xác định"),
      );
    }
    setLoading(false);
  };
  return (
    <div className="relative min-h-screen bg-[#f7f5f0] flex items-center justify-center px-4 overflow-hidden">
      <BackgroundLayer />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <MailCheck className="h-8 w-8 text-orange-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Vui lòng xác thực email
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tài khoản của bạn chưa được xác thực. Chúng tôi đã gửi email xác
              thực đến địa chỉ email bạn đã đăng ký. Vui lòng kiểm tra hộp thư
              và nhấn vào liên kết xác thực để tiếp tục đăng nhập.
            </p>

            <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
              Liên kết xác thực có thể hết hạn sau một khoảng thời gian. Nếu
              không thấy email, hãy kiểm tra mục Spam hoặc Thư rác.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleSubmit}
                type="button"
                className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Gửi lại email xác thực
              </button>

              <Link
                to="/login"
                className="block w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
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
