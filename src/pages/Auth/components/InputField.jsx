export default function InputField({
  id,
  label,
  type = "text",
  placeholder,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 ml-1 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800 outline-none transition "
      />
    </div>
  );
}
