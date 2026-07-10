import { useState } from "react";
import Branding from "./Branding";
import WelcomeSection from "./WelcomeSection";
import LoginForm from "./LoginForm";
import Divider from "./Divider";
import SocialLoginGroup from "./SocialLoginGroup";
import RegisterText from "./RegisterText";

export default function LoginCard() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative rounded-[28px] bg-white p-8 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
          <svg className="animate-spin h-10 w-10 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-base font-semibold text-slate-700">Đang đăng nhập...</span>
        </div>
      )}
      <WelcomeSection />
      <SocialLoginGroup loading={loading} setLoading={setLoading} />
      <Divider />
      <LoginForm loading={loading} setLoading={setLoading} />
      <RegisterText />
    </div>
  );
}
