import { Users, ArrowRight } from "lucide-react";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "PRIVATE";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount: number;
  status: CommunityGroupStatus;
  type?: CommunityGroupType;
  visibility?: "PUBLIC" | "PRIVATE" | "COMMUNITY";
  createdAt: string;
  isMember?: boolean;
}

interface CommunityGroupCardProps {
  group: CommunityGroup;
  recommended?: boolean;
  onView?: (id: number) => void;
  onJoin?: (id: number) => void;
}

export default function CommunityGroupCard({
  group,
  recommended = false,
  onView,
  onJoin,
}: CommunityGroupCardProps) {
  return (
    <article className="flex flex-col min-h-[175px] rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md overflow-hidden">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-2">
              {group.name}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5">
              {group.visibility === "COMMUNITY" ? (
                <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600 border border-teal-100">
                  Cộng đồng
                </span>
              ) : group.visibility === "PRIVATE" ? (
                <span className="shrink-0 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                  Nhóm riêng tư
                </span>
              ) : (
                <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                  Nhóm học tập
                </span>
              )}

              {recommended && (
                <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-100">
                  Gợi ý
                </span>
              )}

              <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-250/60">
                <Users size={11} className="text-gray-400" />
                {group.memberCount} thành viên
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onJoin?.(group.id)}
            disabled={group.isMember}
            className="flex w-full items-center justify-center gap-1.5 h-10 rounded-lg bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            {group.isMember ? "Đã tham gia" : "Tham gia"}
            {!group.isMember && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
}
