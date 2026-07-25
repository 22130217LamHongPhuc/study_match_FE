import React from "react";
import documentImg from "../../../assets/img/libraby-document.png";

interface HeaderBannerProps {
  onUploadClick: () => void;
  onMyLibraryClick: () => void;
  isSmDown: boolean;
}

export default function HeaderBanner({ onUploadClick, onMyLibraryClick }: HeaderBannerProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={documentImg}
            alt="Thư viện học tập"
            className="h-28 w-auto object-contain mix-blend-multiply"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Thư viện học liệu</h1>
            <p className="text-sm text-gray-500">
              Chia sẻ, lưu trữ và tìm kiếm tài liệu học tập bổ ích từ bạn học trong trường.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onMyLibraryClick}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 focus:outline-none"
          >
            Thư viện của tôi
          </button>
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none"
          >
            + Đóng góp tài liệu
          </button>
        </div>
      </div>
    </section>
  );
}
