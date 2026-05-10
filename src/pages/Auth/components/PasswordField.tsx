import { Link } from "react-router-dom";

export default function PasswordField({
  id,
  label,
  placeholder,
  onChange,
  value,
}: {
  id: string;
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) {
  return (
    <div>
      <div className="mb-2 ml-1 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-800"
        >
          Mật khẩu
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-black-700 transition hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <input
        id={id}
        name={id}
        value={value}
        type="password"
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 outline-none"
      />
    </div>
  );
}
