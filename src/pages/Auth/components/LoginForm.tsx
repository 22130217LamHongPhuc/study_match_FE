import { useState } from "react";
import { AuthResponse, login } from "../../../services/AuthService";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { useNavigate } from "react-router-dom";
import { APIResponseData } from "../../../config/APIResponse";
import { toast } from "react-toastify";

export default function LoginForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response: APIResponseData<AuthResponse> = await login(
        email,
        password,
      );
      setLoading(false);

      if (response.success) {
        console.log(response.data);
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userId", response.data.userId.toString());

        console.log("Access Token login:", response.data.accessToken);
        console.log("Refresh Token login:", response.data.refreshToken);

        if (!response.data.emailVerified) {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }

        if (!response.data.onboardingCompleted) {
          navigate("/onboarding");
          return;
        }
        navigate("/home");
      } else {
        setErrorMsg(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
        toast.error(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium animate-shake">
          {errorMsg}
        </div>
      )}

      <InputField
        id="email"
        label="Email"
        value={email}
        placeholder="22130000@st.hcmuaf.edu.vn"
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordField
        id="password"
        label="Password"
        value={password}
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-accent-500 py-3 text-base font-medium text-white transition hover:bg-accent-600"
      >
        Đăng nhập
      </button>
    </form>
  );
}
