import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { Subject, getAllSubjects } from "../../../services/GroupService";
import { uploadPostMedia } from "../../../services/SocialPostService";
import { createDocument } from "../../../services/DocumentService";
import { toast } from "react-toastify";
import { isApiSuccess } from "../../../config/apiClient";
import { useConfirm } from "../../../components/modal/ConfirmModal";

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  subjects?: Subject[];
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "TEXTBOOK", label: "Giáo trình" },
  { value: "LECTURE_SLIDE", label: "Slide bài giảng" },
  { value: "EXERCISE", label: "Bài tập" },
  { value: "EXAM", label: "Đề thi / Ôn tập" },
  { value: "REFERENCE", label: "Tài liệu tham khảo" },
  { value: "SOURCE_CODE", label: "Mã nguồn" },
  { value: "STUDY_NOTE", label: "Ghi chú học tập" },
  { value: "OTHER", label: "Khác" }
];

export default function UploadDocumentModal({ open, onClose, onSuccess }: UploadDocumentModalProps) {
  const confirm = useConfirm();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [localSubjects, setLocalSubjects] = useState<Subject[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formErrors, setFormErrors] = useState<{
    file?: string;
    title?: string;
    subjectId?: string;
    category?: string;
    confirmed?: string;
  }>({});

  const isDirty = Boolean(file || title || subjectId || category || description || sourceName || confirmed);

  useEffect(() => {
    if (open) {
      const fetchSubjects = async () => {
        try {
          const res = await getAllSubjects();
          if (isApiSuccess(res) && res.data) {
            setLocalSubjects(res.data);
          }
        } catch (e) {
          console.error("Failed to load subjects inside modal", e);
        }
      };
      void fetchSubjects();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFile(null);
      setTitle("");
      setSubjectId("");
      setCategory("");
      setDescription("");
      setSourceName("");
      setConfirmed(false);
      setErrorMessage(null);
      setFormErrors({});
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedExtensions = ["pdf", "docx", "pptx"];
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setFormErrors(prev => ({ ...prev, file: "Định dạng file không hỗ trợ (Chỉ nhận PDF, DOCX, PPTX)" }));
      setFile(null);
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, file: "Dung lượng file tối đa là 20MB" }));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFormErrors(prev => ({ ...prev, file: undefined }));
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf("."));
      setTitle(nameWithoutExt.substring(0, 255));
    }
  };

  const handleRequestClose = async () => {
    if (uploading) return;
    if (isDirty) {
      const confirmClose = await confirm({
        title: "Đóng cửa sổ",
        message: "Dữ liệu đang nhập sẽ bị mất. Bạn chắc chắn muốn đóng?",
        type: "warning",
        confirmText: "Đóng",
        cancelText: "Hủy",
      });
      if (!confirmClose) return;
    }
    onClose();
  };

  const extractStorageKey = (url: string) => {
    if (!url) return "";
    const parts = url.split("/");
    const filenameWithExt = parts[parts.length - 1];
    const lastDot = filenameWithExt.lastIndexOf(".");
    return lastDot !== -1 ? filenameWithExt.substring(0, lastDot) : filenameWithExt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    const errors: typeof formErrors = {};
    if (!file) errors.file = "Vui lòng chọn file tài liệu";
    if (!title.trim()) errors.title = "Vui lòng nhập tiêu đề tài liệu";
    if (!subjectId) errors.subjectId = "Vui lòng chọn môn học tương ứng";
    if (!category) errors.category = "Vui lòng chọn loại tài liệu";
    if (!confirmed) errors.confirmed = "Bạn phải đồng ý với cam kết đóng góp";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const uploadRes = await uploadPostMedia(file!);
      if (!uploadRes || !uploadRes.mediaUrl) {
        setErrorMessage("Tải file lên máy chủ thất bại.");
        setUploading(false);
        return;
      }

      const fileUrl = uploadRes.mediaUrl;
      const storageKey = extractStorageKey(fileUrl);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: Number(subjectId),
        category,
        fileUrl,
        storageKey: storageKey || undefined,
        originalFileName: file!.name,
        fileType: file!.name.split(".").pop()?.toLowerCase() || "",
        mimeType: file!.type || "application/octet-stream",
        fileSize: file!.size,
        sourceName: sourceName.trim() || undefined
      };

      const docRes = await createDocument(payload);
      if (isApiSuccess(docRes)) {
        toast.success("Đóng góp tài liệu thành công, vui lòng chờ kiểm duyệt!");
        onSuccess();
        onClose();
      } else {
        setErrorMessage(docRes.message || "Không thể lưu thông tin tài liệu.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="max-h-[calc(100vh-60px)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Đóng góp tài liệu học tập</h2>
            <p className="text-xs text-gray-500">
              Chia sẻ tài liệu bổ ích để cùng xây dựng cộng đồng học tập vững mạnh.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            disabled={uploading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <span className="text-sm font-semibold text-gray-700 block mb-2">
                File tài liệu <span className="text-red-500">*</span>
              </span>
              <label className="block">
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                    formErrors.file
                      ? "border-red-300 bg-red-50/30 hover:bg-red-50/50"
                      : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50"
                  } ${uploading ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${formErrors.file ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"}`}>
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {file ? file.name : "Kéo thả file vào đây hoặc bấm để chọn"}
                  </p>
                  {file ? (
                    <p className="mt-1 text-xs text-gray-400">
                      Dung lượng: {formatSize(file.size)} · Định dạng: {file.name.split(".").pop()?.toUpperCase()}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">
                      Hỗ trợ định dạng PDF, DOCX, PPTX (Tối đa 20MB)
                    </p>
                  )}
                </div>
              </label>
              {formErrors.file && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{formErrors.file}</p>
              )}
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">
                Tiêu đề tài liệu <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.substring(0, 255))}
                maxLength={255}
                disabled={uploading}
                placeholder="Ví dụ: Đề thi lập trình nâng cao NLU"
                className={`${inputClass} ${formErrors.title ? "!border-red-400 focus:!border-red-400 focus:!ring-red-100" : ""}`}
              />
              {formErrors.title && (
                <p className="text-xs font-medium text-red-500">{formErrors.title}</p>
              )}
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-gray-700">
                  Môn học <span className="text-red-500">*</span>
                </span>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setFormErrors(prev => ({ ...prev, subjectId: undefined }));
                  }}
                  disabled={uploading}
                  className={`${inputClass} ${formErrors.subjectId ? "!border-red-400 focus:!border-red-400 focus:!ring-red-100" : ""}`}
                >
                  <option value="" disabled>Chọn môn học tương ứng</option>
                  {localSubjects.map((sub) => (
                    <option key={sub.subjectId} value={sub.subjectId}>
                      {sub.subjectName} ({sub.subjectCode})
                    </option>
                  ))}
                </select>
                {formErrors.subjectId && (
                  <p className="text-xs font-medium text-red-500">{formErrors.subjectId}</p>
                )}
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-gray-700">
                  Loại tài liệu <span className="text-red-500">*</span>
                </span>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setFormErrors(prev => ({ ...prev, category: undefined }));
                  }}
                  disabled={uploading}
                  className={`${inputClass} ${formErrors.category ? "!border-red-400 focus:!border-red-400 focus:!ring-red-100" : ""}`}
                >
                  <option value="" disabled>Chọn phân mục</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-xs font-medium text-red-500">{formErrors.category}</p>
                )}
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">Mô tả tài liệu</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={uploading}
                placeholder="Tóm tắt ngắn gọn nội dung tài liệu học tập..."
                className={`${inputClass} resize-none`}
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-gray-700">Tác giả / Nguồn tài liệu</span>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                disabled={uploading}
                placeholder="Ví dụ: Đại học Nông Lâm TP.HCM, Thầy Nguyễn Văn A..."
                className={inputClass}
              />
            </label>

            <div>
              <label className="inline-flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    setFormErrors(prev => ({ ...prev, confirmed: undefined }));
                  }}
                  disabled={uploading}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500 select-none leading-relaxed">
                  Tôi cam đoan tài liệu này không vi phạm bản quyền, không chứa nội dung phản cảm, độc hại và chịu trách nhiệm với nội dung đã đăng tải.
                </span>
              </label>
              {formErrors.confirmed && (
                <p className="mt-1 ml-6 text-xs font-medium text-red-500">{formErrors.confirmed}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-gray-100 px-6 py-4 justify-end">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={uploading}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Đang tải lên...
                </>
              ) : (
                "Đóng góp tài liệu"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
export { CATEGORIES };
