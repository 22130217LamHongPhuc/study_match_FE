import InputField from "./InputField";
import Divider from "./Divider";
import SocialAuthGroup from "./SocialLoginGroup";
import { AuthResponse, register } from "../../../services/AuthService";
import { useState } from "react";
import { APIResponseData } from "../../../config/APIResponse";
import { useNavigate } from "react-router-dom";
import { LoadingSkeleton } from "../../../components/modal/basic/LoadingSkeleton";

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

    if (!validateEmail(email)) {
      setErrorEmail(
        "Vui lòng nhập email hợp lệ (định dạng: 22130xxx@st.hcmuaf.edu.vn)",
      );
      return;
    } else {
      setErrorEmail(null);
    }

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
      alert(responese.message || "Đăng ký thất bại. Vui lòng thử lại");
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
    <div className="rounded-[28px] bg-white p-8">
      <div className="mb-6 text-center ">
        <h2 className="mb-2 text-3xl font-bold">Đăng ký tài khoản</h2>
        <p className="text-sm font-medium text-slate-500">
          Tham gia cộng đồng StudyMatch ngay hôm nay.
        </p>
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <SocialAuthGroup />
          <Divider />
          <div className="flex flex-col gap-5 mb-5">


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

            {errorPassword && (
              <p className="text-sm text-red-500">{errorPassword}</p>
            )}

            <InputField
              id="confirmPassword"
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errorConfirmPassword && (
              <p className="text-sm text-red-500">{errorConfirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white transition hover:bg-green-700"
            onClick={handleSubmit}
          >
            Tạo tài khoản
          </button>


          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Đã có tài khoản?
              <a
                href="#"
                className="ml-1 font-bold text-green-700 hover:underline"
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
