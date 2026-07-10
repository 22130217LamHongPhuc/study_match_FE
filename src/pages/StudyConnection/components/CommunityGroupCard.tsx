import React from "react";
import { Users, Calendar, Check } from "lucide-react";

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

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <GroupAvatar
              url={group.avatarUrl}
              name={group.name}
              initials={initials}
              bgClass={avatarBg}
            />
            {group.status === "ACTIVE" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 text-sm font-bold text-gray-800">
              <span className="truncate max-w-[120px]" title={group.name}>
                {group.name}
              </span>
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                <Check size={8} className="stroke-[3.5px]" />
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[150px]" title={group.subjectName}>
              Chủ đề: {group.subjectName}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Mã nhóm: #{group.id}
            </p>
          </div>
        </div>
        {recommended && (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600 border border-orange-100 shrink-0">
            Gợi ý
          </span>
        )}
      </div>

      <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3.5 text-xs py-4 border-t border-b border-gray-100 my-4">
        {group.memberCount !== undefined && group.memberCount !== null && (
          <>
            <span className="font-bold text-gray-700">Thành viên</span>
            <div className="flex items-center gap-1 text-gray-600 font-medium">
              <Users size={12} className="text-gray-400" />
              {group.memberCount} thành viên
            </div>
          </>
        )}

        <span className="font-bold text-gray-700">Trạng thái</span>
        <span className={`font-semibold ${group.status === "ACTIVE" ? "text-emerald-600" : "text-gray-500"}`}>
          {group.status === "ACTIVE" ? "Đang hoạt động" : "Tạm dừng"}
        </span>

        <span className="font-bold text-gray-700">Loại nhóm</span>
        <span className="font-medium text-gray-600">
          {group.type === "COMMUNITY" ? "Cộng đồng" : (group.type === "PUBLIC" || group.type === "PRIVATE" || group.type === "STUDY") ? "Học tập" : "Khác"}
        </span>

        {group.createdAt && (
          <>
            <span className="font-bold text-gray-700">Ngày tạo</span>
            <div className="flex items-center gap-1 text-gray-500 font-medium">
              <Calendar size={12} className="text-gray-400" />
              <span>{new Date(group.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onView?.(group.id)}
          className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Nhắn tin
        </button>

        <button
          type="button"
          onClick={() => onView?.(group.id)}
          className="flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Xem chi tiết
        </button>

        <button
          type="button"
          onClick={() => onJoin?.(group.id)}
          disabled={group.isMember}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors disabled:cursor-not-allowed ${group.isMember
            ? "border border-emerald-200 bg-emerald-50 text-emerald-600 disabled:opacity-100"
            : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            }`}
        >
          {group.isMember ? "Đã tham gia" : "Tham gia"}
        </button>
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
