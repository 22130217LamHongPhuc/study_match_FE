import React from "react";

interface WelcomeBannerProps {
  onFindMatch?: () => void;
  onPostGroup?: () => void;
}

export default function WelcomeBanner({ onFindMatch, onPostGroup }: WelcomeBannerProps) {
  return (
    <div className="rounded-2xl bg-white p-6 md:p-8 border border-gray-200 border-l-4 border-l-orange-500 shadow-xs">
      <div className="max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl tracking-tight">
          Chào mừng trở lại, StudyMatching
        </h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Tìm bạn học phù hợp, tham gia nhóm hoặc đăng bài để kết nối với những người có cùng mục tiêu học tập.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onFindMatch}
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 transition-colors cursor-pointer"
          >
            Tìm bạn học phù hợp
          </button>

        </div>
      </div>
    </div>
  );
}
