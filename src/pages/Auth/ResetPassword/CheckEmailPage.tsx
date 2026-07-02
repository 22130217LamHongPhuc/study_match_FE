import { MailCheck } from "lucide-react";
import BackgroundLayer from "../components/BackgroundLayer";


export default function CheckEmailPage() {
  return (
    <div className="relative min-h-screen bg-[#f7f5f0] flex items-center justify-center px-4 overflow-hidden">
      <BackgroundLayer />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">

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
      </div>
    </div>
  );
}
