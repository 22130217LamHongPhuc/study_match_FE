import React from "react";
import { Plus, Trash2, Library, BookOpen } from "lucide-react";
import { CurriculumSubject } from "../types";

interface CurriculumDetailProps {
  curriculumName: string;
  subjects: CurriculumSubject[];
  loading: boolean;
  onAssignSubject: (year: number, semester: number) => void;
  onRemoveSubject: (subjectId: number, subjectName: string) => void;
}

export function CurriculumDetail({
  curriculumName,
  subjects,
  loading,
  onAssignSubject,
  onRemoveSubject,
}: CurriculumDetailProps) {
  // We support Year 1 to 4 and Semester 1 to 3
  const years = [1, 2, 3, 4];
  const semesters = [1, 2, 3];

  const getSubjectsForTerm = (year: number, sem: number) => {
    return subjects
      .filter((s) => s.studyYearNo === year && s.semesterNo === sem)
      .sort((a, b) => (a.recommendedOrder || 0) - (b.recommendedOrder || 0));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-sand-200 bg-white">
      <div className="border-b border-sand-200 bg-sand-50 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sand-800">
          Chi tiết Chương trình: <span className="text-[#3b82f6]">{curriculumName}</span>
        </h2>
      </div>

      <div className="p-4 space-y-8 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="py-20 text-center text-xs text-sand-500 animate-pulse">
            Đang tải dữ liệu môn học...
          </div>
        ) : (
          years.map((year) => {
            // Check if there are any subjects in this year to render compactly, or just show all years
            return (
              <div key={year} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-sand-200 pb-1.5">
                  <BookOpen size={16} className="text-sand-600" />
                  <h3 className="text-sm font-bold text-sand-900">Năm học {year}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semesters.map((sem) => {
                    const termSubjects = getSubjectsForTerm(year, sem);

                    return (
                      <div
                        key={sem}
                        className="rounded-lg border border-sand-200 bg-sand-50/25 p-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-sand-150">
                            <span className="text-xs font-bold text-sand-700">Học kỳ {sem}</span>
                            <button
                              type="button"
                              onClick={() => onAssignSubject(year, sem)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                            >
                              <Plus size={12} />
                              Gán môn
                            </button>
                          </div>

                          <div className="mt-2.5 space-y-2 min-h-[40px]">
                            {termSubjects.length === 0 ? (
                              <div className="py-4 text-center text-[11px] text-sand-400 font-medium">
                                Chưa gán môn học nào
                              </div>
                            ) : (
                              termSubjects.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between gap-2 rounded bg-white p-2 border border-sand-200"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-sand-800 truncate">
                                      {sub.subject?.subjectName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-sand-400 font-mono">
                                        {sub.subject?.subjectCode}
                                      </span>
                                      <span
                                        className={`inline-flex items-center rounded px-1 py-0.5 text-[9px] font-medium border ${
                                          sub.required
                                            ? "border-amber-100 bg-amber-50 text-amber-800"
                                            : "border-blue-100 bg-blue-50/70 text-blue-800"
                                        }`}
                                      >
                                        {sub.required ? "Bắt buộc" : "Tự chọn"}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onRemoveSubject(sub.subject?.subjectId || 0, sub.subject?.subjectName || "")}
                                    className="rounded p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors shrink-0"
                                    title="Gỡ môn khỏi lộ trình"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
