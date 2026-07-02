import React from "react";

interface StepProps {
  number: string;
  title: string;
  description: string;
  details: string[];
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, details, isLast }) => (
  <div className="relative flex gap-6 md:gap-8">
    <div className="flex flex-col items-center flex-shrink-0 w-12">
      <div className="w-12 h-12 rounded-full border-2 border-[#1a3557] bg-white flex items-center justify-center z-10">
        <span className="text-sm font-black text-[#1a3557]">{number}</span>
      </div>
      {!isLast && (
        <div className="mt-2 w-px flex-1 bg-gray-200 min-h-[60px]" />
      )}
    </div>

    <div className={`${!isLast ? "pb-10" : ""} flex-1`}>
      <h3 className="text-lg font-bold text-[#1a3557] mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {details.map((d) => (
          <span
            key={d}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-white border border-gray-200 text-gray-600"
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Tạo hồ sơ học tập",
      description: "Điền thông tin về môn học, kỹ năng, mục tiêu học tập và khung giờ rảnh trong tuần. Chỉ mất vài phút.",
      details: ["Mục tiêu học tập", "Môn học & kỹ năng", "Thời gian rảnh", "Phong cách học"],
    },
    {
      number: "02",
      title: "Nhận gợi ý từ AI",
      description: "Hệ thống phân tích hồ sơ và đưa ra danh sách bạn học / nhóm học phù hợp nhất, kèm điểm tương thích theo từng tiêu chí.",
      details: ["Điểm tương thích %", "Môn học chung", "Lịch rảnh trùng", "Mục tiêu phù hợp"],
    },
    {
      number: "03",
      title: "Kết nối & học cùng nhau",
      description: "Gửi lời mời kết nối, nhắn tin, học qua video call và đặt lịch nhóm. Sau mỗi buổi, gửi phản hồi để AI tự cải thiện.",
      details: ["Chat & Video Call", "Lịch học nhóm", "Phản hồi sau buổi", "AI tự học"],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#f97316]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#f97316]">Quy trình</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3557] leading-tight">
              Chỉ 3 bước để bắt đầu học nhóm hiệu quả.
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Thiết kế tối giản — giảm thời gian thiết lập, tăng thời gian thực sự học.
            </p>
          </div>

          <div>
            {steps.map((step, idx) => (
              <Step key={step.title} {...step} isLast={idx === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
