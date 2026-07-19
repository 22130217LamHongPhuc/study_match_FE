import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import nluLogo from "../../../assets/img/nlu.png";

const NLUSection: React.FC = () => {
  return (
    <section className="relative py-12 overflow-hidden bg-white border-b border-gray-100 flex items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src={nluLogo}
          alt="NLU Background Watermark"
          className="w-full h-full object-cover opacity-[0.22] sm:opacity-[0.25] filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full text-center flex flex-col items-center justify-center space-y-5 animate-fade-in">
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
          Không gian học tập số dành riêng cho <br />
          <span className="bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] bg-clip-text text-transparent">
            Sinh viên CNTT Nông Lâm
          </span>
        </h2>

        <p className="text-gray-600 text-[15px] leading-relaxed max-w-2xl mx-auto">
          StudyMatch đồng hành cùng sinh viên Khoa Công nghệ Thông tin - Trường Đại học Nông Lâm TP.HCM. 
          Nền tảng hỗ trợ bạn tìm kiếm nhóm học tập phù hợp, chia sẻ kho tài liệu môn học chuyên ngành và cùng nhau chinh phục các mục tiêu học tập.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition-all duration-200 shadow-lg shadow-[#3b82f6]/20"
          >
            Tham gia cộng đồng NLU IT ngay
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>

          <div className="flex items-center gap-4 px-2 text-[13px] text-gray-600 font-semibold">
            <div>
              <span className="font-extrabold text-[#3b82f6] text-[15px]">1,200+</span> Sinh viên
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div>
              <span className="font-extrabold text-[#3b82f6] text-[15px]">80+</span> Nhóm học
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NLUSection;
