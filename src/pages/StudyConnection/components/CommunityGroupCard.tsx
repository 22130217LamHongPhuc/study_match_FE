import React from "react";
import { Users, ArrowRight } from "lucide-react";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "PRIVATE" | "PUBLIC" | "STUDY";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount?: number;
  status: CommunityGroupStatus;
  type?: CommunityGroupType;
  visibility?: "PUBLIC" | "PRIVATE" | "COMMUNITY";
  createdAt: string;
  isMember?: boolean;
  avatarUrl?: string | null;
  isJoinRequestPending?: boolean;
}

interface CommunityGroupCardProps {
  group: CommunityGroup;
  recommended?: boolean;
  onView?: (id: number) => void;
  onJoin?: (id: number) => void;
}

const AVATAR_COLORS = [
  "bg-orange-400",
  "bg-rose-400",
  "bg-amber-500",
  "bg-lime-500",
  "bg-pink-400",
  "bg-red-400",
  "bg-yellow-500",
  "bg-emerald-500",
];

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "?";
}

function GroupAvatar({
  url,
  name,
  initials,
  bgClass,
}: {
  url?: string | null;
  name: string;
  initials: string;
  bgClass: string;
}) {
  const [error, setError] = React.useState(false);
  if (url && !error) {
    return (
      <img
        src={url}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-full object-cover border border-gray-100"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bgClass} text-sm font-bold text-white`}
    >
      {initials}
    </div>
  );
}

export default function CommunityGroupCard({
  group,
  recommended = false,
  onView,
  onJoin,
}: CommunityGroupCardProps) {
  const initials = getInitials(group.name);
  const avatarBg = getAvatarColor(group.id);
  const isJoinDisabled = Boolean(group.isMember || group.isJoinRequestPending);
  const joinLabel = group.isMember
    ? "Đã tham gia"
    : group.isJoinRequestPending
      ? "Chờ duyệt"
      : "Tham gia";

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

              <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-500 border border-gray-200/60">
                <Users size={11} className="text-gray-400" />
                {group.memberCount} thành viên
              </span>
            </div>
          </div>

          <GroupAvatar
            url={group.avatarUrl}
            name={group.name}
            initials={initials}
            bgClass={avatarBg}
          />
        </div>

        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onJoin?.(group.id)}
            disabled={isJoinDisabled}
            className="flex w-full items-center justify-center gap-1.5 h-10 rounded-lg bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          >
            {joinLabel}
            {!isJoinDisabled && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
}
