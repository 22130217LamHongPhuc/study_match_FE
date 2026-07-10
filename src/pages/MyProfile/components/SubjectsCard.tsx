import { ProfileViewModel } from "../types";

interface SubjectsCardProps {
  profile: ProfileViewModel;
}

export default function SubjectsCard({ profile }: SubjectsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h3 className="text-base font-bold text-gray-800">Học phần đăng ký</h3>
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-xs font-semibold text-gray-400 mb-1">
            Môn học chính
          </span>
          <p className="text-sm font-semibold text-gray-800">
            {profile.mainSubjectName}
          </p>
        </div>

        <div>
          <span className="block text-xs font-semibold text-gray-400 mb-2">
            Môn học đang tham gia
          </span>
          {profile.enrolledSubjects.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Chưa đăng ký môn học nào.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.enrolledSubjects.map((subject) => (
                <span
                  key={subject.subjectId}
                  className="inline-flex items-center rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  <span className="font-bold text-orange-600 mr-1">
                    {subject.subjectCode}
                  </span>
                  - {subject.subjectName}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
