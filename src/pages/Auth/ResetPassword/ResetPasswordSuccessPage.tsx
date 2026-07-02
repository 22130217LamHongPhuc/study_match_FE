import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import BackgroundLayer from "../components/BackgroundLayer";


export default function ResetPasswordSuccessPage() {
  return (
    <div className="relative min-h-screen bg-[#f7f5f0] flex items-center justify-center px-4 overflow-hidden">
      <BackgroundLayer />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800">
          Đổi mật khẩu thành công
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại bằng mật
          khẩu mới.
        </p>

        <Link
          to="/login"
          className="mt-8 block w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
