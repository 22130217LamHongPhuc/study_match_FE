import { Globe2, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  createCommunityGroup,
  CreateStudyGroupRequest,
  getAllSubjects,
} from "../../../../services/GroupService";
import { toast } from "sonner";
import { Subject } from "../../../Onboarding/components";
import { Numbers } from "@mui/icons-material";
import { LoadingSkeleton } from "../../../../components/modal/basic/LoadingSkeleton";

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
  const [description, setDescription] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    if (!open) return;

    window.addEventListener("keydown", handleKeyDown);

    loadSubjects();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const loadSubjects = async () => {
    const res = await getAllSubjects();

    if (!res.success) {
      toast.error(
        "Failed to load subjects: " + (res.message || "Unknown error"),
      );
      return;
    }

    setSubjects(res.data);
  };

  const handleCreateCommunity = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên cộng đồng");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Vui lòng chọn môn học");
      return;
    }
    setLoading(true);

    const createGroupRequest: CreateStudyGroupRequest = {
      ownerUserId: Number(localStorage.getItem("userId")),
      name: name.trim(),
      subjectName:
        subjects.find((s) => s.subjectId === selectedSubjectId)?.subjectName ||
        "",
      description: description.trim(),
      mainSubjectId: selectedSubjectId,
    };

    const res = await createCommunityGroup(createGroupRequest);
    if (res.success) {
      toast.success("Cộng đồng đã được tạo thành công");
      onClose();
    }
    setLoading(false);
  };

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
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Tạo cộng đồng
                </h3>
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

            <div className="space-y-3">
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
                <select
                  id={subjectId}
                  value={selectedSubjectId || ""}
                  onChange={(e) => {
                    const selected = subjects.find(
                      (s) => s.subjectId === Number(e.target.value),
                    );
                    setSelectedSubjectId(Number(e.target.value) || null);
                  }}
                  className="h-8 w-full rounded border border-gray-300 bg-gray-50 px-3 text-[12px] font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                >
                  <option value="">Chọn môn học</option>
                  {subjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
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
                  type="button"
                  onClick={handleCreateCommunity}
                  className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded bg-gray-900 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-gray-800"
                >
                  <Plus size={14} />
                  Tạo cộng đồng
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
