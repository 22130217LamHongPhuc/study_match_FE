export default function Divider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 italic text-slate-400">
          Hoặc bằng email
        </span>
      </div>
    </div>
  );
}
