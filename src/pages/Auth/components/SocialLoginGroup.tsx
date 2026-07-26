import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginWithGoogle } from "../../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { isApiSuccess } from "../../../config/apiClient";

export default function SocialLoginGroup({
  loading: externalLoading,
  setLoading: externalSetLoading,
}: {
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
}) {
  const navigate = useNavigate();
  const [internalLoading, setInternalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const setLoading = externalSetLoading !== undefined ? externalSetLoading : setInternalLoading;

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const idToken = credentialResponse.credential;

      if (!idToken) {
        const message = "Không lấy được thông tin xác thực Google";
        setErrorMsg(message);
        setLoading(false);
        return;
      }
      const response = await loginWithGoogle(idToken);

      if (isApiSuccess(response) && response.data?.accessToken && response.data?.refreshToken) {
        console.log("Google login successful:", response.data);
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userId", response.data.userId.toString());
        if (!response.data.onboardingCompleted) {
          navigate("/onboarding");
          return;
        }
        navigate("/home");
      } else {
        const message =
          response.code === "USER_LOCKED"
            ? "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động bởi quản trị viên"
            : response.message || "Đăng nhập Google thất bại. Vui lòng thử lại";
        setErrorMsg(message);
        setLoading(false);
      }
    } catch (error) {
      console.log("Google login error:", error);
      const message = "Không thể đăng nhập bằng Google. Vui lòng thử lại sau.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const showLocalOverlay = externalLoading === undefined && loading;

  return (
    <div className="relative flex flex-col items-center gap-2 w-full min-h-[44px]">
      {errorMsg && (
        <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 animate-shake">
          {errorMsg}
        </div>
      )}
      {showLocalOverlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-[#2563eb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-sm font-semibold text-slate-600">Đang xác thực...</span>
        </div>
      )}
      <div className={loading ? "pointer-events-none opacity-50" : ""}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log("Google Login Failed");
            setLoading(false);
          }}
          text="signin_with"
          theme="outline"
          size="large"
          shape="rectangular"
          width="400"
        />
      </div>
    </div>
  );
}
