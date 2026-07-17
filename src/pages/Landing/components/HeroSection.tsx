import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, Users } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative pt-16 min-h-screen flex items-center overflow-hidden"
      style={{ background: "#f7f5f0" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #1a3557 0px,
            #1a3557 1px,
            transparent 1px,
            transparent 12px
          )`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="space-y-8 animate-fade-in">


            <div className="space-y-4">

              <p className="text-base text-gray-600 leading-relaxed max-w-md">
                StudyMatch kết nối sinh viên dựa trên mục tiêu, môn học, kỹ năng và lịch rảnh — không còn tìm bạn nhóm theo kiểu may rủi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] transition-colors duration-200"
              >
                Bắt đầu học cùng StudyMatch
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  const el = document.querySelector("#features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#1a3557] bg-white border border-gray-300 rounded-lg hover:border-[#1a3557] hover:bg-gray-50 transition-colors duration-200"
              >
                Khám phá tính năng
              </button>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#1a3557", "#0d7e6d", "#d4a017", "#4a3f7a"].map((bg, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: bg }}
                    >
                      {["N", "T", "H", "L"][i]}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-px h-5 bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0d7e6d]" />
                <span className="text-sm text-gray-600">Miễn phí cho sinh viên</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Gợi ý hôm nay</p>
                    <p className="text-sm font-bold text-[#1a3557] mt-0.5">Bạn học phù hợp với bạn</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#0d7e6d] bg-[#0d7e6d]/10 px-2.5 py-1 rounded-md">
                    AI
                  </span>
                </div>

                {[
                  { name: "Nguyễn Minh Anh", major: "Machine Learning ", tags: ["Giải thuật", "AI"], match: 96, avatar: "MA", avatarBg: "#1a3557" },
                  { name: "Trần Hoài Nam", major: "Cấu trúc dữ liệu", tags: ["CSDL", "Mạng"], match: 88, avatar: "HN", avatarBg: "#0d7e6d" },
                  { name: "Lê Thu Hương", major: "Lập trình Web", tags: ["Web", "UX"], match: 81, avatar: "TH", avatarBg: "#4a3f7a" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: p.avatarBg }}
                    >
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.major}</p>
                      <div className="flex gap-1 mt-1">
                        {p.tags.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-black" style={{ color: i === 0 ? "#d4a017" : "#1a3557" }}>{p.match}%</div>
                      <div className="text-[10px] text-gray-400">tương thích</div>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1a3557]/5 border border-[#1a3557]/10">
                    <Clock className="w-4 h-4 text-[#1a3557]" />
                    <div>
                      <p className="text-xs font-bold text-[#1a3557]">T2, T4, T6</p>
                      <p className="text-[10px] text-gray-500">18:00 – 21:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0d7e6d]/8 border border-[#0d7e6d]/15"
                    style={{ backgroundColor: "rgba(13,126,109,0.06)" }}
                  >
                    <Users className="w-4 h-4 text-[#0d7e6d]" />
                    <div>
                      <p className="text-xs font-bold text-[#0d7e6d]">3 nhóm học</p>
                      <p className="text-[10px] text-gray-500">đang hoạt động</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
