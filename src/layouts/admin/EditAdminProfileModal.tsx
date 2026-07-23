import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, UserRound, FileText, Loader2, Camera } from "lucide-react";
import { getUserById, updateAdminProfile } from "../../services/UserService";
import { uploadPostMedia } from "../../services/SocialPostService";
import { toast } from "react-toastify";

type EditAdminProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (fullName: string, avatarUrl: string | null) => void;
};

export function EditAdminProfileModal({
  open,
  onClose,
  onSuccess,
}: EditAdminProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const loadProfile = async () => {
      const currentUserId = Number(localStorage.getItem("userId"));
      if (!currentUserId) return;
      setFetching(true);
      try {
        const data = await getUserById(currentUserId);
        if (data) {
          setFullName(data.fullName || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatarUrl || "");
          setAvatarPreview(data.avatarUrl || "");
          setAvatarFile(null);
        }
      } catch {
        toast.error("Không thể tải thông tin cá nhân");
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, [open]);

  if (!open) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning("Họ và tên không được để trống");
      return;
    }
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadRes = await uploadPostMedia(avatarFile);
        if (uploadRes && uploadRes.mediaUrl) {
          finalAvatarUrl = uploadRes.mediaUrl;
        } else {
          toast.error("Không thể upload ảnh đại diện");
          setLoading(false);
          return;
        }
      }

      const res = await updateAdminProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl,
      });

      if (res.success && res.data) {
        toast.success("Cập nhật thông tin cá nhân thành công");
        localStorage.setItem("fullName", res.data.fullName);
        if (res.data.avatarUrl) {
          localStorage.setItem("avatarUrl", res.data.avatarUrl);
        } else {
          localStorage.removeItem("avatarUrl");
        }
        onSuccess(res.data.fullName, res.data.avatarUrl);
        onClose();
      } else {
        toast.error(res.message || "Cập nhật thông tin thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Chỉnh sửa thông tin cá nhân"
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={loading || fetching ? undefined : onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Chỉnh sửa thông tin cá nhân
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || fetching}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Đóng modal"
          >
            <X size={16} />
          </button>
        </div>

        {fetching ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-[#3b82f6]" />
              <p className="text-xs font-semibold text-slate-500">Đang tải thông tin...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="flex flex-col items-center justify-center pb-2">
              <div
                onClick={loading ? undefined : handleAvatarClick}
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 transition hover:border-[#3b82f6]"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <UserRound size={36} />
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
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Nhấp để tải ảnh đại diện lên
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="profile-fullName"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Họ và tên
                </label>
                <div className="relative mt-1">
                  <UserRound
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    id="profile-fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                    placeholder="Nhập họ và tên"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-bio"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Tiểu sử
                </label>
                <div className="relative mt-1">
                  <FileText
                    className="pointer-events-none absolute left-3 top-3 text-slate-400"
                    size={16}
                  />
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={loading}
                    rows={3}
                    placeholder="Viết một vài dòng về bạn..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#3b82f6] focus:bg-white disabled:opacity-60 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-sm font-semibold text-white transition-all shadow-md shadow-[#3b82f6]/10 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
