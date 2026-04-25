export default function PasswordField({ id, label, placeholder, onChange }) {
  return (
    <div>
      <div className="mb-2 ml-1 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-slate-800"
        >
          Mật khẩu
        </label>
        <a
          href="#"
          className="text-sm font-semibold text-black-700 transition hover:underline"
        >
          Quên mật khẩu?
        </a>
      </div>

      <input
        id={id}
        name={id}
        type="password"
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 outline-none"
      />
    </div>
  );
}
