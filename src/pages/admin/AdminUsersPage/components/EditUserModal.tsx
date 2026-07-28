import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, User, FileText, Loader2, Camera } from "lucide-react";
import { updateAdminUserProfile } from "../../../../services/UserService";
import { uploadPostMedia } from "../../../../services/SocialPostService";
import { toast } from "react-toastify";
import type { AdminUserDbRow } from "../types";
import { normalizeAvatarUrl } from "../../../../services/FriendService";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

type EditUserModalProps = {
  open: boolean;
  user: AdminUserDbRow | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
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
    if (open && user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setAvatarPreview(user.avatar_url ? normalizeAvatarUrl(user.avatar_url) || "" : "");
      setAvatarFile(null);
      setErrorMsg(null);
      setLoading(false);
    }
  }, [open, user]);

  if (!open || !user) return null;

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
    if (!fullName.trim()) {
      setErrorMsg("Họ tên không được để trống");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadRes = await uploadPostMedia(avatarFile);
        if (uploadRes && uploadRes.mediaUrl) {
          finalAvatarUrl = uploadRes.mediaUrl;
        } else {
          setErrorMsg("Không thể tải lên ảnh đại diện");
          setLoading(false);
          return;
        }
      }

      const res = await updateAdminUserProfile(user.user_id, {
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: finalAvatarUrl || null,
      });

      if (res.success) {
        toast.success(res.message || "Cập nhật thông tin thành công");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Cập nhật thông tin thất bại");
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
      aria-label="Chỉnh sửa thông tin người dùng"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={loading ? undefined : onClose}
        className="absolute inset-0 bg-black/30"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-sand-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-4 py-3">
          <h3 className="text-base font-semibold text-sand-900">
            Chỉnh sửa thông tin người dùng
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div
                onClick={loading ? undefined : handleAvatarClick}
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-sand-200 bg-sand-50 transition hover:border-blue-500 shadow-sm flex items-center justify-center"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sand-400">
                    <User size={36} />
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
                Nhấp vào ảnh để tải ảnh đại diện lên
              </p>
            </div>

            {/* Email (Read-only status info) */}
            <div>
              <label className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                Email / ID
              </label>
              <div className="mt-1 block w-full rounded-lg border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-sand-600">
                {user.email} (ID: {user.user_id})
              </div>
            </div>

            {/* Họ tên */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                Họ và tên
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sand-400">
                  <User size={16} />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  placeholder="Nhập họ và tên..."
                  className="block w-full rounded-lg border border-sand-200 bg-white py-2 pl-10 pr-3 text-sm text-sand-800 placeholder-sand-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-sand-50"
                />
              </div>
            </div>

            {/* Tiểu sử (Bio) */}
            <div>
              <label htmlFor="bio" className="block text-xs font-semibold text-sand-500 uppercase tracking-wider">
                Tiểu sử (Bio)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute top-3 left-0 flex items-start pl-3 text-sand-400">
                  <FileText size={16} />
                </div>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  placeholder="Giới thiệu ngắn về người dùng..."
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
      </div>
    </div>,
    document.body,
  );
}
