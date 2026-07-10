import React from "react";
import { Brain, UserCircle, Users, MessageSquare } from "lucide-react";

interface FeatureItemProps {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  isHighlighted?: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon, tag, title, description, bullets, isHighlighted,
}) => (
  <div
    className={`rounded-xl p-6 border transition-all duration-200 ${isHighlighted
      ? "bg-[#1a3557] border-[#1a3557] text-white"
      : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-md"
      }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHighlighted ? "bg-white/10" : "bg-gray-100"
          }`}
      >
        <div className={isHighlighted ? "text-[#d4a017]" : "text-[#1a3557]"}>{icon}</div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isHighlighted ? "bg-white/10 text-white/70" : "bg-gray-100 text-gray-500"
          }`}
      >
        {tag}
      </span>
    </div>

    <h3 className={`text-base font-bold mb-1.5 ${isHighlighted ? "text-white" : "text-gray-900"}`}>
      {title}
    </h3>
    <p className={`text-sm leading-relaxed mb-4 ${isHighlighted ? "text-white/70" : "text-gray-500"}`}>
      {description}
    </p>

    <ul className="space-y-1.5">
      {bullets.map((b) => (
        <li key={b} className="flex items-start gap-2 text-xs">
          <span
            className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${isHighlighted ? "bg-[#d4a017]" : "bg-[#0d7e6d]"
              }`}
          />
          <span className={isHighlighted ? "text-white/80" : "text-gray-600"}>{b}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      tag: "AI Core",
      title: "AI Matching thông minh",
      description:
        "AI phân tích hồ sơ học tập để gợi ý bạn học 1-1 hoặc nhóm học phù hợp theo mục tiêu, môn học, trình độ và thời gian rảnh.",
      bullets: [
        "Gợi ý bạn học 1-1 phù hợp",
        "Đề xuất nhóm học tương thích",
        "Điểm tương thích theo từng tiêu chí",
      ],
      isHighlighted: true,
    },
    {
      icon: <UserCircle className="w-5 h-5" />,
      tag: "Hồ sơ",
      title: "Hồ sơ học tập cá nhân",
      description:
        "Khai báo mục tiêu, môn học, trình độ, kỹ năng và lịch rảnh để hệ thống hiểu nhu cầu học tập của bạn.",
      bullets: [
        "Mục tiêu & định hướng học tập",
        "Môn học, kỹ năng và trình độ",
        "Thời gian rảnh để ghép lịch học",
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      tag: "Kết nối",
      title: "Kết nối bạn học & nhóm học",
      description:
        "Dễ dàng gửi lời mời kết bạn học 1-1, tạo nhóm học mới hoặc tham gia nhóm được gợi ý theo môn học.",
      bullets: [
        "Kết nối học tập giữa 2 người",
        "Tạo hoặc tham gia nhóm học",
        "Quản lý thành viên và lịch học",
      ],
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      tag: "Giao tiếp",
      title: "Chat & Video Call học tập",
      description:
        "Trao đổi trực tiếp với bạn học hoặc nhóm học thông qua chat, video call và lịch học tích hợp.",
      bullets: [
        "Chat riêng và chat nhóm",
        "Video call 1-1 hoặc theo nhóm",
        "Lịch học và nhắc nhở buổi học",
      ],
    },
  ];

  return (
    <section id="features" className="py-24" style={{ background: "#f7f5f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-3">

            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3557] leading-tight">
              Học đúng người,<br />đúng mục tiêu.
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs sm:text-right leading-relaxed">
            Bốn tính năng cốt lõi được thiết kế để tối ưu hóa trải nghiệm học nhóm của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <FeatureItem key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
