import React from "react";
import welcomeImg from "../../assets/img/welcome.png";

interface WelcomeBannerProps {
  onFindMatch?: () => void;
  onPostGroup?: () => void;
}

export default function WelcomeBanner({ onFindMatch, onPostGroup }: WelcomeBannerProps) {
  return (
    <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-xs">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={welcomeImg}
            alt="Chào mừng"
            className="h-32 md:h-36 w-auto object-contain mix-blend-multiply"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800 md:text-xl tracking-tight">
              Chào mừng trở lại
            </h1>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">
              Kết nối bạn học, tham gia nhóm và cùng nhau học tập hiệu quả.
            </p>
          </div>
        </div>

        <button
          onClick={onFindMatch}
          className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-600 transition-colors cursor-pointer shrink-0"
        >
          Tìm bạn học phù hợp
        </button>
      </div>
    </div>
  );
}
