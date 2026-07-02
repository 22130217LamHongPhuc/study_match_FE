import { InfoIcon, Camera } from "lucide-react";
import SectionCard from "./SectionCard";
import React, { useRef } from "react";

const fieldClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200/40";

const textAreaClassName =
  "min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-green-300 focus:ring-2 focus:ring-green-200/40";

interface BasicInfoSectionProps {
  groupName: string;
  goalDescription: string;
  avatarPreview?: string | null;
  onAvatarChange?: (file: File | null, preview: string | null) => void;
  onChange: (next: { groupName: string; goalDescription: string }) => void;
}

export default function BasicInfoSection({
  groupName,
  goalDescription,
  avatarPreview,
  onAvatarChange,
  onChange,
}: BasicInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      const previewUrl = URL.createObjectURL(file);
      onAvatarChange(file, previewUrl);
    }
  };

  return (
    <SectionCard
      icon={<InfoIcon className="h-5 w-5" />}
      title="Thông tin cơ bản"
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            <div 
              className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:bg-slate-100"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Group Avatar" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <button 
              type="button"
              className="text-sm font-medium text-green-600 hover:text-green-700"
              onClick={() => fileInputRef.current?.click()}
            >
              Tải ảnh lên
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tên nhóm
              </label>
              <input
                className={fieldClassName}
                placeholder="v.d. Nhóm ôn tập Java"
                type="text"
                value={groupName}
                onChange={(e) =>
                  onChange({ groupName: e.target.value, goalDescription })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mô tả mục tiêu
              </label>
              <textarea
                className={textAreaClassName}
                placeholder="Mô tả mục tiêu tập trung của nhóm..."
                value={goalDescription}
                onChange={(e) =>
                  onChange({ groupName, goalDescription: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
