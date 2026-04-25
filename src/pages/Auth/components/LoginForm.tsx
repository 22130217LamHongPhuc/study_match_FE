import { useState } from "react";
import { AuthResponse, login } from "../../../services/AuthService";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { useNavigate } from "react-router-dom";
import { APIResponseData } from "../../../config/APIResponse";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response: APIResponseData<AuthResponse> = await login(
        email,
        password,
      );

      if (response.success) {
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);

        navigate("/");
      } else {
        alert(response.message || "Đăng nhập thất bại. Vui lòng thử lại");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
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
        type="submit"
        className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition hover:bg-green-700"
        onClick={handleSubmit}
      >
        Đăng nhập
      </button>
    </div>
  );
}
