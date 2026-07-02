import React from "react";
import { Check } from "lucide-react";

const BenefitsSection: React.FC = () => {
  const studentBenefits = [
    "Tiết kiệm thời gian tìm bạn học — AI làm thay trong vài giây",
    "Tăng hiệu quả học nhóm nhờ ghép đúng trình độ và mục tiêu",
    "Kết nối với người có cùng đam mê và định hướng học tập",
  ];

  const systemBenefits = [
    "Hỗ trợ văn hóa học cộng tác trong môi trường đại học",
    "Dữ liệu phản hồi sau buổi học giúp cải thiện chất lượng gợi ý",
    "Dễ mở rộng cho nhiều khoa hoặc toàn trường",
  ];

  return (
    <section id="benefits" className="py-24" style={{ background: "#f7f5f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-14 space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="w-5 h-0.5 bg-[#f97316]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f97316]">Lợi ích</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3557] leading-tight">
            Giá trị thực sự cho<br />tất cả mọi người.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-[#f97316]" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Dành cho sinh viên</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xl font-bold text-[#1a3557]">
                Học hiệu quả hơn,<br />kết nối dễ hơn.
              </p>
              <p className="text-sm text-gray-500">
                StudyMatch loại bỏ những rào cản lãng phí thời gian trong việc tìm bạn học phù hợp.
              </p>
              <ul className="space-y-3 pt-2">
                {studentBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#f97316]/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#f97316]" />
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#1a3557" }}
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#0d7e6d]" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Dành cho nhà trường</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xl font-bold text-white">
                Thúc đẩy học cộng tác<br />toàn trường.
              </p>
              <p className="text-sm text-white/60">
                Hệ thống cung cấp dữ liệu học tập hữu ích, hỗ trợ giáo viên và nhà trường theo dõi hiệu quả học nhóm.
              </p>
              <ul className="space-y-3 pt-2">
                {systemBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#0d7e6d]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#0d7e6d]" />
                    </div>
                    <span className="text-sm text-white/80 leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
