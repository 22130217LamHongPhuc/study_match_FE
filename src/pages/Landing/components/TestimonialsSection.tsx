import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Nhờ StudyMatch, mình đã tìm được bạn học cùng ngành rất tuyệt! Cả hai cùng tiến bộ mỗi ngày.",
      name: "Mai Anh",
      role: "Sinh viên khóa 2022",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      quote: "Việc học nhóm chưa bao giờ dễ dàng đến thế. Lịch học linh hoạt và mọi thứ rất tiện lợi.",
      name: "Minh Quân",
      role: "Sinh viên khóa 2023",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      quote: "Giao diện đẹp, dễ dùng và cộng đồng rất tích cực. Highly recommend!",
      name: "Thu Trang",
      role: "Sinh viên khóa 2024",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      quote: "Tìm bạn học ôn thi cuối kỳ cực nhanh. Nhờ đó mà điểm GPA kỳ này của mình tăng đáng kể.",
      name: "Khánh Linh",
      role: "Sinh viên khóa 2022",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      quote: "Thực sự hữu ích cho việc làm bài tập lớn. Mình đã tìm được những đồng đội rất có trách nhiệm.",
      name: "Đức Huy",
      role: "Sinh viên khóa 2023",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 6,
      quote: "Một dự án rất thiết thực cho sinh viên Nông Lâm. Mình khuyên các bạn khóa dưới nên tham gia.",
      name: "Hải Nam",
      role: "Sinh viên khóa 2024",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 7,
      quote: "Học nhóm trực tuyến qua StudyMatch rất ổn định. Mình có thể vừa call video vừa share tài liệu ôn tập môn Lập trình Web cực kỳ hiệu quả.",
      name: "Thùy Dương",
      role: "Sinh viên khóa 2023",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 8,
      quote: "Nhờ bộ lọc thời khóa biểu trùng nhau của StudyMatch mà nhóm mình dễ dàng tìm được lịch trống chung để đi thư viện học nhóm.",
      name: "Tuấn Kiệt",
      role: "Sinh viên khóa 2022",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 9,
      quote: "Là tân sinh viên, mình rất lo lắng về các môn đại cương. Thật may vì đã tìm được các anh chị khóa trên hướng dẫn học tập rất nhiệt tình.",
      name: "Ngọc Bích",
      role: "Sinh viên khóa 2024",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
    },
    {
      id: 10,
      quote: "Nền tảng ghép đôi rất chính xác. Mình và bạn học ghép đôi đã cùng ôn tập và đạt điểm A môn Cấu trúc dữ liệu và giải thuật.",
      name: "Quốc Bảo",
      role: "Sinh viên khóa 2023",
      avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&auto=format&fit=crop&q=80",
    },
  ];

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemsPerPage = windowWidth >= 1024 ? 3 : windowWidth >= 768 ? 2 : 1;
  const maxIndex = testimonials.length - itemsPerPage;

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex >= 0 ? maxIndex : 0);
    }
  }, [itemsPerPage, maxIndex, currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  return (
    <section id="testimonials" className="py-10 bg-white border-b border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 mb-10">
          Cộng đồng nói gì về StudyMatch
        </h2>

        <div className="relative px-4 sm:px-8 md:px-12">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-gray-600 hover:text-[#3b82f6] hover:shadow-lg transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out -mx-4"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm shadow-gray-50/50 hover:shadow-md transition-all duration-200">
                    <div className="space-y-2">
                      <span className="text-[#3b82f6] font-serif text-[42px] leading-none block h-4 select-none opacity-80">
                        “
                      </span>
                      <p className="text-gray-700 text-[14px] leading-relaxed">
                        {t.quote}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-gray-50">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                      />
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900">{t.name}</h4>
                        <p className="text-[12px] text-gray-400 font-semibold">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center text-gray-600 hover:text-[#3b82f6] hover:shadow-lg transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-[#3b82f6]" : "bg-gray-200"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
