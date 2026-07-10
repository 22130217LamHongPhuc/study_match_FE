import { useState } from "react";
import { AuthResponse, login } from "../../../services/AuthService";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { useNavigate } from "react-router-dom";
import { APIResponseData } from "../../../config/APIResponse";
import { LoadingSkeleton } from "../../../components/modal/basic/LoadingSkeleton";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

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
        alert(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-5">
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
            type="button"
            className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition hover:bg-green-700"
            onClick={handleSubmit}
          >
            Đăng nhập
          </button>
        </div>
      )}
    </>
  );
}
