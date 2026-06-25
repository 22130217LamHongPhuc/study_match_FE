import { useNavigate } from "react-router-dom";

export default function RegisterText() {

  const navigate = useNavigate();
  return (
    <p className="mt-10 text-center text-sm text-slate-500 md:text-base">
      Bạn chưa có tài khoản?
      <span onClick={() => navigate("/register")} className="ml-1 font-bold text-green-700 cursor-pointer hover:text-green-800 transition-colors ">
        Đăng ký ngay
      </span>
    </p>
  );
}
