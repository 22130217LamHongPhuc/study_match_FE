import React from "react";

interface ProblemCardProps {
  number: string;
  title: string;
  description: string;
  accentColor: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ number, title, description, accentColor }) => (
  <div className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-400 hover:shadow-md transition-all duration-200 overflow-hidden">
    {/* Left accent bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accentColor }} />

    <div className="pl-2">
      {/* Large number */}
      <div className="text-5xl font-black mb-4 leading-none" style={{ color: accentColor, opacity: 0.15 }}>
        {number}
      </div>
      <div className="-mt-6">
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const ProblemSection: React.FC = () => {
  const problems = [
    {
      number: "01",
      accentColor: "#1a3557",
      title: "Khó tìm bạn cùng mục tiêu học tập",
      description: "Mỗi sinh viên có định hướng khác nhau. Tìm đúng người học cùng thường mất nhiều tuần và kết quả vẫn là may rủi.",
    },
    {
      number: "02",
      accentColor: "#d4a017",
      title: "Lịch rảnh không trùng nhau",
      description: "Dù đã tìm được người phù hợp, lịch học và thời gian rảnh lại không ăn khớp — buổi học nhóm cứ thế hoãn mãi.",
    },
    {
      number: "03",
      accentColor: "#0d7e6d",
      title: "Nhóm học không tương thích",
      description: "Ghép nhóm ngẫu nhiên dẫn đến chênh lệch trình độ, thiếu động lực, và hiệu quả học giảm đáng kể.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left heading – takes 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#f97316]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f97316]">Vấn đề</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3557] leading-tight">
              Tìm nhóm học không nên là chuyện may rủi.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Hàng ngàn sinh viên mỗi học kỳ mất hàng giờ chỉ để tìm người học cùng phù hợp — và vẫn thường thất bại.
            </p>
            {/* Stat callout */}
            <div className="border-l-4 border-[#d4a017] pl-4 py-1">
              <div className="text-3xl font-black text-[#1a3557]">68%</div>
              <div className="text-xs text-gray-500 mt-0.5">sinh viên thấy nhóm học không phù hợp với mình</div>
            </div>
          </div>

          {/* Right cards – takes 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            {problems.map((p) => (
              <ProblemCard key={p.number} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
