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
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-[min(560px,calc(100vw-32px))] rounded-xl border border-sand-200 bg-white p-6 shadow-lg">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-sand-900">
                  Tạo cộng đồng
                </h3>
                <p className="mt-0.5 text-xs font-medium text-sand-500">
                  Dành cho nhóm mở do Admin quản lý
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-50 text-accent-600">
                  <Globe2 size={16} />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor={nameId}
                  className="mb-1 block text-sm font-medium text-sand-700"
                >
                  Tên cộng đồng
                </label>
                <input
                  id={nameId}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
                  placeholder="VD: Cộng đồng Lập trình Java"
                />
              </div>

              <div>
                <label
                  htmlFor={subjectId}
                  className="mb-1 block text-sm font-medium text-sand-700"
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
                  className="h-9 w-full rounded-lg border border-sand-300 bg-sand-50 px-3 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
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
                  className="mb-1 block text-sm font-medium text-sand-700"
                >
                  Mô tả ngắn
                </label>
                <textarea
                  id={descId}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-sand-300 bg-sand-50 px-3 py-2.5 text-sm font-medium text-sand-800 outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
                  placeholder="Không gian trao đổi chung cho sinh viên..."
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 flex-1 rounded-lg border border-sand-300 bg-white px-3 text-sm font-medium text-sand-700 transition-all hover:bg-sand-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateCommunity}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-sand-900 text-sm font-medium text-white transition-all hover:bg-sand-800"
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
