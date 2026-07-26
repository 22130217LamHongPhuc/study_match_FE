import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  showForgotPasswordLink?: boolean;
}

export default function PasswordField({
  id,
  label,
  placeholder,
  onChange,
  value,
  showForgotPasswordLink = false,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-2 ml-1 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-800"
        >
          {label}
        </label>
        {showForgotPasswordLink && (
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-accent-500 transition hover:underline hover:text-accent-600"
          >
            Quên mật khẩu?
          </Link>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          name={id}
          value={value}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-5 pr-12 py-4 text-slate-800 outline-none transition focus:border-accent-500 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 transition"
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
