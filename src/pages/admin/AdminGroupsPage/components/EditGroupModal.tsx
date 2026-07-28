import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Users, FileText, Loader2, Camera, HelpCircle } from "lucide-react";
import {
  getAdminGroupDetail,
  updateAdminGroupDetails,
  getAllSubjects,
  getGroupAvatarUrl,
  UpdateStudyGroupRequest,
  AdminGroupType,
  AdminGroupVisibility,
} from "../../../../services/GroupService";
import { Subject } from "../../../Onboarding/components";
import { toast } from "react-toastify";

const DEFAULT_GROUP_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";

type EditGroupModalProps = {
  open: boolean;
  groupId: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditGroupModal({
  open,
  groupId,
  onClose,
  onSuccess,
}: EditGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [maxMembers, setMaxMembers] = useState(10);
  const [visibility, setVisibility] = useState<AdminGroupVisibility>("PUBLIC");
  const [groupType, setGroupType] = useState<AdminGroupType>("STUDY");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && groupId) {
      loadGroupDetails();
      loadSubjects();
    }
  }, [open, groupId]);

  const loadSubjects = async () => {
    try {
      const res = await getAllSubjects();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (e) {
      console.error("Failed to load subjects", e);
    }
  };

  const loadGroupDetails = async () => {
    if (!groupId) return;
    setFetching(true);
    setErrorMsg(null);
    setAvatarFile(null);

    try {
      const res = await getAdminGroupDetail(groupId);
      if (res.success && res.data) {
        const detail = res.data;
        setName(detail.name || "");
        setDescription(detail.description || "");
        setSelectedSubjectId(detail.mainSubjectId || null);
        setMaxMembers(detail.maxMembers || 10);
        setVisibility(detail.visibility || "PUBLIC");
        setGroupType(detail.groupType);
        setAvatarUrl(detail.avatarUrl || "");
        setAvatarPreview(detail.avatarUrl ? getGroupAvatarUrl(detail) || "" : "");
      } else {
        setErrorMsg(res.message || "Không thể tải thông tin nhóm");
      }
    } catch {
      setErrorMsg("Có lỗi xảy ra khi kết nối máy chủ để tải thông tin nhóm.");
    } finally {
      setFetching(false);
    }
  };

  if (!open || !groupId) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Tên nhóm học/cộng đồng không được để trống");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const payload: UpdateStudyGroupRequest = {
      name: name.trim(),
      description: description.trim(),
      mainSubjectId: selectedSubjectId || undefined,
      subjectName: subjects.find((s) => s.subjectId === selectedSubjectId)?.subjectName || undefined,
    };

    if (groupType === "STUDY") {
      payload.maxMembers = maxMembers;
      payload.visibility = visibility as "PUBLIC" | "PRIVATE";
    }

    try {
      const res = await updateAdminGroupDetails(groupId, payload, avatarFile || undefined);
      if (res.success) {
        toast.success("Cập nhật thông tin nhóm thành công");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Cập nhật thông tin nhóm thất bại");
      }
    } catch {
      setErrorMsg("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chỉnh sửa thông tin nhóm"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={loading || fetching ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">
            {groupType === "COMMUNITY" ? "Chỉnh sửa cộng đồng" : "Chỉnh sửa nhóm học tập"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || fetching}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        {fetching ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <p className="text-xs font-semibold text-sand-500">Đang tải thông tin nhóm...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {errorMsg && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Group Avatar Upload */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div
                  onClick={loading ? undefined : handleAvatarClick}
                  className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-xl border-2 border-sand-200 bg-sand-50 transition hover:border-blue-500 shadow-sm flex items-center justify-center"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Group Avatar Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_GROUP_AVATAR;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sand-400">
                      <Users size={36} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={18} />
                    <span className="mt-1 text-[10px] font-medium">Thay đổi</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                />
                <p className="mt-2 text-xs font-semibold text-sand-500">
                  Nhấp vào ảnh để tải ảnh đại diện nhóm lên
                </p>
              </div>

              {/* Tên nhóm */}
              <div>
                <label htmlFor="groupName" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                  Tên {groupType === "COMMUNITY" ? "cộng đồng" : "nhóm học tập"}
                </label>
                <input
                  id="groupName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder={`Nhập tên ${groupType === "COMMUNITY" ? "cộng đồng" : "nhóm học tập"}...`}
                  className="mt-1 block w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 placeholder-sand-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                />
              </div>

              {/* Môn học (Subject select) */}
              <div>
                <label htmlFor="subjectSelect" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                  Môn học liên quan
                </label>
                <select
                  id="subjectSelect"
                  value={selectedSubjectId || ""}
                  onChange={(e) => setSelectedSubjectId(Number(e.target.value) || null)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                >
                  <option value="">Chọn môn học...</option>
                  {subjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {groupType === "STUDY" && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Số thành viên tối đa */}
                  <div>
                    <label htmlFor="maxMembers" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                      Thành viên tối đa
                    </label>
                    <input
                      id="maxMembers"
                      type="number"
                      min={1}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value) || 1)}
                      disabled={loading}
                      className="mt-1 block w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                    />
                  </div>

                  {/* Quyền riêng tư */}
                  <div>
                    <label htmlFor="visibility" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                      Quyền riêng tư
                    </label>
                    <select
                      id="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as AdminGroupVisibility)}
                      disabled={loading}
                      className="mt-1 block w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                    >
                      <option value="PUBLIC">Công khai (Public)</option>
                      <option value="PRIVATE">Riêng tư (Private)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Mô tả nhóm (Description) */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                  Mô tả chi tiết
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute top-3 left-0 flex items-start pl-3 text-sand-400">
                    <FileText size={16} />
                  </div>
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    placeholder="Nhập mô tả hoạt động của nhóm học..."
                    className="block w-full resize-none rounded-lg border border-sand-200 bg-white py-2 pl-10 pr-3 text-sm text-sand-800 placeholder-sand-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-sand-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-sand-200 bg-white px-4 py-2 text-sm font-medium text-sand-600 transition-colors hover:bg-sand-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
