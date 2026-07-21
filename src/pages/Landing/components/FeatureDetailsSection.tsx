import React from "react";
import studyProfileImg from "../../../assets/img/study_profile.png";
import connectFriendImg from "../../../assets/img/connect_friend.png";
import scheduleImg from "../../../assets/img/schedule.png";
import reportImg from "../../../assets/img/report.png";

const FeatureDetailsSection: React.FC = () => {
  const features = [
    {
      id: 1,
      title: "Hồ sơ học tập thông minh",
      description: "Chỉ cần chọn môn học bạn muốn ôn tập, đặt mục tiêu điểm số và chọn những khung giờ rảnh trong tuần. Hồ sơ học tập của bạn đã sẵn sàng kết nối!",
      image: studyProfileImg,
    },
    {
      id: 2,
      title: "Thuật toán ghép đôi chuẩn xác",
      description: "Hệ thống tự động tìm kiếm và gợi ý những 'cạ cứng' có cùng lịch rảnh và môn học chung với bạn. Bạn có thể chọn học nhóm 1-1 hoặc nhóm nhỏ từ 3-5 người.",
      image: connectFriendImg,
    },
    {
      id: 3,
      title: "Quản lý lịch học khoa học",
      description: "Tạo lịch hẹn học nhóm siêu nhanh. StudyMatch sẽ tự động chuẩn bị phòng học trực tuyến và gửi tin nhắn nhắc nhở để không thành viên nào bị quên lịch.",
      image: scheduleImg,
    },
    {
      id: 4,
      title: "Báo cáo tiến trình học tập",
      description: "Theo dõi xem mình đã học nhóm được bao nhiêu giờ trong tuần, quan sát sự tiến bộ qua biểu đồ trực quan và nhận những phản hồi dễ thương từ bạn học.",
      image: reportImg,
    },
  ];

  return (
    <section id="features" className="py-12 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Giải pháp toàn diện tối ưu hóa việc học nhóm
          </h2>
          <p className="text-gray-500 text-[14px] max-w-xl mx-auto">
            StudyMatch cung cấp các công cụ đắc lực hỗ trợ bạn tự học và học nhóm một cách khoa học, hiệu quả và có định hướng rõ ràng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white border border-gray-100/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="w-full h-44 bg-slate-50/50 flex items-center justify-center p-5 border-b border-gray-50/50">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="max-h-full max-w-full object-contain select-none filter drop-shadow-sm transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-[12.5px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureDetailsSection;
