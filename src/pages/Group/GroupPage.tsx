import { CalendarDays, ChevronRight, Plus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const group = {
  id: 1,
  name: "Ôn tập Toán A1",
  description: "Đây là nhóm dành cho các bạn muốn ôn toán A1",
  subjectName: "Toán cao cấp A1",
  studyGoal: "Standard Learner",
  studyMode: "mutual_support",
  maxMembers: 10,
  visibility: "PUBLIC",
  status: "ACTIVE",
};

function GroupPreviewCard() {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            {group.subjectName}
          </p>

          <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
            {group.name}
          </h2>
        </div>

        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Đang mở
        </span>
      </div>

      <p className="line-clamp-2 min-h-[44px] text-sm leading-6 text-slate-600">
        {group.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          <UsersRound size={14} />
          Tối đa {group.maxMembers}
        </span>

        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          Công khai
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-400">Kiểu học</p>
          <p className="text-sm font-medium text-slate-700">Hỗ trợ lẫn nhau</p>
        </div>

        <button className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          Xem nhóm
          <ChevronRight
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
}

export default function GroupPage() {
  const navigate = useNavigate();

  const goToCreateGroup = () => {
    navigate("/create-group");
  };

  return (
    <main
      className="min-h-screen px-5 py-6 text-slate-900"
      style={{
        background:
          "radial-gradient(circle at 10% 0%, #EAF3FF 0%, #F5F8FF 38%, #F8FAFF 100%)",
      }}
    >
      {" "}
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-slate-500">
              StudyMatch
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Nhóm học phù hợp
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Chọn nhóm theo môn học, mục tiêu và lịch rảnh của bạn.
            </p>
          </div>

          <button
            onClick={goToCreateGroup}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <Plus size={17} />
            Tạo nhóm
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GroupPreviewCard />
        </section>
      </div>
    </main>
  );
}
