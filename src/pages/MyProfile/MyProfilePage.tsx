import AcademicInfoCard from "./components/AcademicInfoCard";
import FreeTimeCard from "./components/FreeTimeCard";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import ScheduleTable from "./components/ScheduleTable";
import SubjectsCard from "./components/SubjectsCard";
import { useProfileData } from "./hooks/useProfileData";
import studyProfileImg from "../../assets/img/study_profile.png";

export default function MyProfilePage() {
  const userId = Number(localStorage.getItem("userId"));

  const { profileVm, loading } = useProfileData(userId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50/30 px-4 py-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
          <span className="text-sm font-medium text-gray-600">
            Đang tải hồ sơ học tập...
          </span>
        </div>
      </div>
    );
  }

  if (!profileVm) {
    return (
      <div className="min-h-screen bg-orange-50/30 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            Không có dữ liệu hồ sơ để hiển thị.
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={studyProfileImg}
                alt="Hồ sơ học tập"
                className="h-28 w-auto object-contain mix-blend-multiply"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800">Hồ sơ học tập</h1>
                <p className="text-sm text-gray-500">
                  Quản lý thông tin học tập cá nhân, môn học và thời gian rảnh của bạn
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Cập nhật lúc: {profileVm.createdAtLabel}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ProfileHeaderCard profile={profileVm} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
          <AcademicInfoCard profile={profileVm} />
          <SubjectsCard profile={profileVm} />
        </div>

        <FreeTimeCard profile={profileVm} />
        <ScheduleTable profile={profileVm} />
      </div>
    </main>
  );
}
