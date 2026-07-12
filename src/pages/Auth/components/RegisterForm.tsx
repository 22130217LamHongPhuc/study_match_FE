import InputField from "./InputField";
import Divider from "./Divider";
import SocialAuthGroup from "./SocialLoginGroup";
import { AuthResponse, register } from "../../../services/AuthService";
import { useState } from "react";
import { APIResponseData } from "../../../config/APIResponse";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<
    string | null
  >(null);
  const [errorFullName, setErrorFullName] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateFullName(fullName)) {
      setErrorFullName("Vui lòng nhập họ tên");
      return;
    } else {
      setErrorFullName(null);
    }

    setErrorEmail(null);


    if (!validatePassword(password)) {
      setErrorPassword("Vui lòng nhập mật khẩu hợp lệ (ít nhất 6 ký tự)");
      return;
    } else {
      setErrorPassword(null);
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
      setErrorConfirmPassword("Mật khẩu xác nhận không khớp");
      return;
    } else {
      setErrorConfirmPassword(null);
    }

    setLoading(true);

    const responese: APIResponseData<AuthResponse> = await register(
      fullName,
      email,
      password,
    );

    setLoading(false);

    if (responese.success) {
      navigate("/login");
    } else {
      toast.error(responese.message || "Đăng ký thất bại. Vui lòng thử lại");
    }
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@st\.hcmuaf\.edu\.vn$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ) => {
    return password === confirmPassword;
  };
  const validateFullName = (fullName: string) => {
    return fullName.trim() !== "";
  };

  return (
    <div className="relative rounded-[28px] bg-white p-8 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
          <svg className="animate-spin h-10 w-10 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-base font-semibold text-slate-700">Đang xử lý...</span>
        </div>
      )}
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-3xl font-bold">Đăng ký tài khoản</h2>
        <p className="text-sm font-medium text-slate-500">
          Tham gia cộng đồng StudyMatch ngay hôm nay.
        </p>
      </div>

      <SocialAuthGroup loading={loading} setLoading={setLoading} />
      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          id="fullName"
          label="Họ tên sinh viên"
          type="text"
          placeholder="Nhập họ tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errorFullName && <p className="text-sm text-red-500">{errorFullName}</p>}

        <InputField
          id="email"
          label="Email sinh viên"
          type="email"
          placeholder="21110xxx@st.hcmuaf.edu.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errorEmail && <p className="text-sm text-red-500">{errorEmail}</p>}

        <InputField
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorPassword && <p className="text-sm text-red-500">{errorPassword}</p>}

        <InputField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorConfirmPassword && <p className="text-sm text-red-500">{errorConfirmPassword}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition hover:bg-green-700 mt-2"
        >
          Tạo tài khoản
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="mt-10 text-center text-sm text-slate-500 md:text-base">
          Đã có tài khoản?
          <Link
            to="/login"
            className="ml-1 font-bold text-green-700 cursor-pointer hover:text-green-800 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
