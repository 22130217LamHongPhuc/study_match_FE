import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import groupImg from "../../../assets/img/group.png";

const CTASection: React.FC = () => {
  return (
    <section className="py-3 bg-gradient-to-r from-blue-50/40 via-[#f0f4ff]/40 to-indigo-50/40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left w-full md:w-auto">
            <img
              src={groupImg}
              alt="Study Group Illustration"
              className="w-20 md:w-28 h-auto object-contain flex-shrink-0 select-none"
            />
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
                Sẵn sàng tìm bạn học lý tưởng?
              </h2>
              <p className="text-gray-500 text-[13px] mt-1 leading-relaxed max-w-xl">
                Tham gia StudyMatch ngay hôm nay và bắt đầu hành trình học tập hiệu quả!
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-lg transition-all duration-200 shadow-md shadow-[#3b82f6]/20 whitespace-nowrap"
            >
              Đăng ký miễn phí
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
