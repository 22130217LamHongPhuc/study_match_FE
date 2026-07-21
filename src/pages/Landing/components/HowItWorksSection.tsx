import React from "react";
import { UserCheck, Search, MessageSquare, Trophy } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Tạo hồ sơ",
      description: "Tạo tài khoản và cập nhật thông tin về môn học, mục tiêu và thời gian biểu của bạn.",
      icon: <UserCheck className="w-8 h-8 text-[#3b82f6]" />,
    },
    {
      id: 2,
      title: "Tìm kiếm & Ghép đôi",
      description: "Hệ thống sẽ gợi ý những người bạn học phù hợp nhất với bạn.",
      icon: <Search className="w-8 h-8 text-[#3b82f6]" />,
    },
    {
      id: 3,
      title: "Kết nối & Lên kế hoạch",
      description: "Bắt đầu trò chuyện và cùng nhau lên kế hoạch học tập cụ thể.",
      icon: <MessageSquare className="w-8 h-8 text-[#3b82f6]" />,
    },
    {
      id: 4,
      title: "Học tập & Tiến bộ",
      description: "Cùng nhau học tập, hỗ trợ và theo dõi tiến độ để đạt được mục tiêu.",
      icon: <Trophy className="w-8 h-8 text-[#3b82f6]" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-10 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Cách hoạt động</h2>
          <p className="text-gray-500 text-[14px]">
            Chỉ với 4 bước đơn giản để tìm bạn học lý tưởng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 flex items-center justify-center mb-5 relative z-10">
                {step.icon}
              </div>

              <h3 className="text-[15px] font-extrabold text-gray-900 mb-2">{step.title}</h3>

              <p className="text-gray-500 text-[13px] leading-relaxed max-w-[240px]">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center absolute top-7 left-[65%] w-[70%] text-gray-300 z-0 pointer-events-none">
                  <span className="flex-1 border-t-2 border-dashed border-gray-200" />
                  <span className="text-[9px] select-none -ml-1.5 opacity-60">▶</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
