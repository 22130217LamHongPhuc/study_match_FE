import React from "react";
import { Link } from "react-router-dom";
import bannerImg from "../../../assets/img/banner.png";

const HeroSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative pt-[100px] pb-[75px] min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/20 border-b border-gray-100"
    >
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-center animate-fade-in">
            <h1 className="text-[38px] sm:text-[46px] lg:text-[52px] font-extrabold tracking-tight text-[#1a202c] leading-[1.3]">
              Ghép đôi học tập <br />
              Cùng nhau <span className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] bg-clip-text text-transparent">tiến bộ!</span>
            </h1>

            <p className="text-[16px] sm:text-[17px] text-gray-600 leading-[1.75] max-w-lg">
              StudyMatch kết nối những người bạn học phù hợp dựa trên mục tiêu, sở thích và thời gian biểu.
              <br className="hidden sm:inline" /> Học cùng nhau – Hiểu nhau – Tiến xa hơn!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 text-[15px] font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg shadow-md shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Bắt đầu ngay
              </Link>
              <button
                onClick={() => {
                  const el = document.querySelector("#features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-3 text-[15px] font-bold text-[#3b82f6] bg-white border border-[#3b82f6]/30 hover:border-[#3b82f6] hover:bg-blue-50/30 rounded-lg transition-all duration-200"
              >
                Tìm hiểu thêm
                <svg className="w-3.5 h-3.5 fill-current text-[#3b82f6]" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center lg:justify-end items-center relative animate-fade-in-up">
            <div className="absolute w-[80%] h-[80%] bg-[#3b82f6]/5 rounded-full blur-2xl -z-10 pointer-events-none" />
            <img
              src={bannerImg}
              alt="StudyMatch Banner"
              className="w-full max-w-[620px] h-auto object-contain drop-shadow-sm select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
