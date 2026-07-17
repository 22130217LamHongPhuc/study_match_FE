import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl px-8 py-14 md:px-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
          style={{ background: "#1a3557" }}
        >
          <div className="space-y-5 max-w-lg">

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sẵn sàng tìm người học phù hợp với bạn?
            </h2>

            <p className="text-white/60 text-sm leading-relaxed">
              Tạo hồ sơ học tập và để StudyMatch gợi ý người đồng hành phù hợp nhất trong cộng đồng sinh viên.
            </p>

            <div className="flex flex-wrap gap-5 pt-2">
              {["Miễn phí cho sinh viên", "Thiết lập trong 3 phút", "Bảo mật dữ liệu"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                  <span className="w-1 h-1 rounded-full bg-[#0d7e6d]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-bold text-white bg-[#2563eb] rounded-xl hover:bg-[#ea6c0a] transition-colors duration-200"
            >
              Bắt đầu ngay — Miễn phí
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium text-white/70 border border-white/20 rounded-xl hover:bg-white/5 hover:text-white transition-colors duration-200"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
