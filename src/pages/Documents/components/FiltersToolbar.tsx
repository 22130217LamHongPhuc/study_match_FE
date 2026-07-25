import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, FilterX, Search } from "lucide-react";
import { Subject } from "../../../services/GroupService";

interface FiltersToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  subjectId: string;
  category: string;
  fileType: string;
  sortBy: string;
  subjects: Subject[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  hasFilters: boolean;
}

const CATEGORIES = [
  { value: "TEXTBOOK", label: "Giáo trình" },
  { value: "LECTURE_SLIDE", label: "Slide bài giảng" },
  { value: "EXERCISE", label: "Bài tập" },
  { value: "EXAM", label: "Đề thi / Ôn tập" },
  { value: "REFERENCE", label: "Tài liệu tham khảo" },
  { value: "SOURCE_CODE", label: "Mã nguồn" },
  { value: "STUDY_NOTE", label: "Ghi chú học tập" },
  { value: "OTHER", label: "Khác" }
];

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "pptx", label: "PPTX" }

];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "downloads", label: "Tải nhiều nhất" },
  { value: "views", label: "Xem nhiều nhất" },
  { value: "ratings", label: "Đánh giá cao nhất" }
];

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[200px] flex-1 sm:flex-initial" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white pl-4 pr-3 py-2.5 text-sm font-semibold text-gray-600 cursor-pointer transition-all focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-50 py-1.5">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FiltersToolbar({
  searchValue,
  onSearchChange,
  subjectId,
  category,
  fileType,
  sortBy,
  subjects,
  onFilterChange,
  onClearFilters,
  hasFilters
}: FiltersToolbarProps) {
  const subjectOptions = [
    { value: "", label: "Tất cả môn học" },
    ...subjects.map(sub => ({
      value: String(sub.subjectId),
      label: `${sub.subjectName} (${sub.subjectCode})`
    }))
  ];

  const categoryOptions = [
    { value: "", label: "Tất cả thể loại" },
    ...CATEGORIES
  ];

  const fileTypeOptions = [
    { value: "", label: "Tất cả định dạng" },
    ...FILE_TYPES
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Integrated Search Input */}
        <div className="relative flex-1 min-w-[260px] md:max-w-xs lg:max-w-sm">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu theo tên, từ khóa..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none cursor-text"
          />
        </div>

        <CustomSelect
          value={subjectId}
          onChange={(val) => onFilterChange("subjectId", val)}
          options={subjectOptions}
          placeholder="Tất cả môn học"
        />

        <CustomSelect
          value={category}
          onChange={(val) => onFilterChange("category", val)}
          options={categoryOptions}
          placeholder="Tất cả thể loại"
        />

        <CustomSelect
          value={fileType}
          onChange={(val) => onFilterChange("fileType", val)}
          options={fileTypeOptions}
          placeholder="Tất cả định dạng"
        />

        <CustomSelect
          value={sortBy}
          onChange={(val) => onFilterChange("sortBy", val)}
          options={SORT_OPTIONS}
          placeholder="Sắp xếp"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 ml-auto focus:outline-none cursor-pointer"
          >
            <FilterX size={16} />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </section>
  );
}
export { CATEGORIES };
