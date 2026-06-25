import { BookOpen, ChevronRight, Globe, Lock, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getGroupsByUserId,
  StudyGroupDetailResponse,
} from "../../services/GroupService";
import { useEffect, useState } from "react";

function GroupPreviewCard({ group }: { group: StudyGroupDetailResponse }) {
  const isGroupActive = group.status === "ACTIVE" || group.status === "active";
  const isPrivate = group.visibility?.toLowerCase() === "private";



  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.04)]">
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
            {group.subjectName}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-1.5 w-1.5 rounded-full ${isGroupActive ? "bg-emerald-500" : "bg-gray-400"}`} />
            {isGroupActive ? "Đang mở" : "Đã đóng"}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-500 transition-colors mb-2">
          {group.name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-6">
          {group.description || "Không có mô tả cho nhóm học này."}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            Tối đa {group.maxMembers}
          </span>

        </div>

        <span className="text-xs font-semibold text-orange-500 group-hover:underline inline-flex items-center gap-0.5">
          Chi tiết
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

export default function GroupPage() {
  const navigate = useNavigate();
  const [groupList, setGroupList] = useState<StudyGroupDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    const res = await getGroupsByUserId(Number(localStorage.getItem("userId")));
    if (res.success) {
      setGroupList(res.data);
    } else {
      alert("Lấy nhóm thất bại: " + (res.message || "Lỗi không xác định"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const goToCreateGroup = () => {
    navigate("/create-group");
  };

  return (
    <main className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Nhóm học của tôi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và chọn nhóm học tập phù hợp với lịch trình của bạn.
            </p>
          </div>

          <button
            onClick={goToCreateGroup}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shrink-0"
          >
            <Plus size={16} />
            Tạo nhóm mới
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
              <p className="text-sm text-gray-500">Đang tải danh sách nhóm học...</p>
            </div>
          </div>
        ) : groupList.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <BookOpen size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Bạn chưa tham gia nhóm nào</h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Tạo nhóm học mới để trao đổi tài liệu, giải bài tập và đồng hành cùng các bạn học khác.
            </p>

            <button
              onClick={goToCreateGroup}
              className="mt-6 inline-flex items-center gap-2 h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} />
              Tạo nhóm mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupList.map((group) => (
              <GroupPreviewCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
