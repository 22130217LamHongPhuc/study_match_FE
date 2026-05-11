import { Globe2, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

export type CommunityCreateValues = {
  name: string;
  subjectName: string;
  description: string;
};

export function CommunityCreateModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CommunityCreateValues) => void;
}) {
  const nameId = useId();
  const subjectId = useId();
  const descId = useId();

  const [name, setName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setSubjectName("");
    setDescription("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center rounded-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Tạo cộng đồng"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative z-10 w-[min(560px,calc(100vw-32px))] rounded border border-gray-200 bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Tạo cộng đồng</h3>
            <p className="mt-0.5 text-[11px] font-medium text-gray-400">
              Dành cho nhóm mở do Admin quản lý
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-50 text-blue-600">
              <Globe2 size={16} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({
              name: name.trim(),
              subjectName: subjectName.trim(),
              description: description.trim(),
            });
          }}
        >
          <div>
            <label
              htmlFor={nameId}
              className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500"
            >
              Tên cộng đồng
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 bg-gray-50 px-3 text-[12px] font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
              placeholder="VD: Cộng đồng Lập trình Java"
            />
          </div>

          <div>
            <label
              htmlFor={subjectId}
              className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500"
            >
              Môn học
            </label>
            <input
              id={subjectId}
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="h-8 w-full rounded border border-gray-300 bg-gray-50 px-3 text-[12px] font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
              placeholder="VD: Lập trình Java"
            />
          </div>

          <div>
            <label
              htmlFor={descId}
              className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500"
            >
              Mô tả ngắn
            </label>
            <textarea
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded border border-gray-300 bg-gray-50 px-3 py-2 text-[12px] font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
              placeholder="Không gian trao đổi chung cho sinh viên..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-8 flex-1 rounded border border-gray-300 bg-white px-3 text-[12px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded bg-gray-900 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-gray-800"
            >
              <Plus size={14} />
              Tạo cộng đồng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
