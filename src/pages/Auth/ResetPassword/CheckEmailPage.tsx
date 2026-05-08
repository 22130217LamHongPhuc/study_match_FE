import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          Kiểm tra email của bạn
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại
          mật khẩu. Liên kết có hiệu lực trong 15 phút.
        </p>

        <div className="mt-8 space-y-3">
          <Link
            to="/forgot-password"
            className="block w-full rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Gửi lại email
          </Link>

          <Link
            to="/login"
            className="block w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
