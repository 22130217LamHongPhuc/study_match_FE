import React from "react";
import { BookOpen, Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Sản phẩm",
      links: [
        { label: "Giới thiệu", href: "#about" },
        { label: "Tính năng", href: "#features" },
        { label: "Cách hoạt động", href: "#how-it-works" },
        { label: "Lợi ích", href: "#benefits" },
      ],
    },
    {
      title: "Pháp lý",
      links: [
        { label: "Điều khoản sử dụng", href: "#" },
        { label: "Chính sách bảo mật", href: "#" },
        { label: "Liên hệ", href: "#" },
        { label: "FAQ", href: "#" },
      ],
    },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer style={{ background: "#0f1e2e" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d4a017] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#1a3557]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">StudyMatch</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Nền tảng học tập thông minh kết nối sinh viên với bạn học và nhóm học phù hợp bằng AI. Học đúng người, đúng mục tiêu.
            </p>

            <div className="space-y-2">
              <a href="mailto:hello@studymatch.vn" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#d4a017] transition-colors">
                <Mail className="w-3.5 h-3.5" />
                hello@studymatch.vn
              </a>
              <a href="tel:+84000000000" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#d4a017] transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +84 000 000 000
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-gray-400 hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {currentYear} StudyMatch. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs text-gray-600">
            Được xây dựng với ♥ dành cho sinh viên Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
