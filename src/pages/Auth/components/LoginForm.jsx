import { useState } from "react";
import { login } from "../../../services/AuthService";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authResponse = await login(email, password);
      console.log(authResponse);
      localStorage.setItem("token", authResponse.data.token);
      localStorage.setItem("refreshToken", authResponse.data.refreshToken);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="space-y-5">
      <InputField
        id="email"
        label="Email"
        placeholder="22130000@st.hcmuaf.edu.vn"
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordField
        id="password"
        label="Password"
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
