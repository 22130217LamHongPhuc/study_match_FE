import { Users, ArrowRight } from "lucide-react";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "PRIVATE";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount: number;
  status: CommunityGroupStatus;
  type: CommunityGroupType;
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
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md overflow-hidden">
      <div className="h-1 bg-orange-400" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
              {group.name}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{group.subjectName}</p>
          </div>

          {recommended && (
            <span className="shrink-0 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-600 border border-orange-100">
              Gợi ý
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            {group.memberCount} thành viên
          </span>
          <span className={`inline-flex items-center gap-1 ${group.status === "ACTIVE" ? "text-green-600" : "text-gray-400"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${group.status === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
            {group.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
          </span>
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
