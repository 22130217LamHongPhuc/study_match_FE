import React from "react";
import { Eye, UserPlus, Check, Clock, AlertCircle } from "lucide-react";
import { FriendRequestVm } from "../../pages/StudyConnection/types";

export interface SuggestedStudentVm {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  studyModeLabel: string;
  matchPercentage: number;
  avgScore: number;
  sharedSubjectCount: number;
  studiedCredits: number;
  friendRequest?: FriendRequestVm | null;
}

interface SuggestedStudentsProps {
  students: SuggestedStudentVm[];
  onViewProfile?: (student: SuggestedStudentVm) => void;
  onConnect?: (userId: number) => void;
  onAccept?: (request: FriendRequestVm) => void;
  currentUserId?: number;
  loading?: boolean;
}

export function SuggestedStudentSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-2/3 bg-gray-100 rounded" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
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

function getAvatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "?";
}

function getMatchColor(match: number) {
  if (match >= 70) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-500",
      track: "bg-emerald-100",
    };
  }
  if (match >= 50) {
    return {
      text: "text-orange-600",
      bg: "bg-orange-500",
      track: "bg-orange-100",
    };
  }
  return {
    text: "text-amber-600",
    bg: "bg-amber-500",
    track: "bg-amber-100",
  };
}

export default function SuggestedStudents({
  students,
  onViewProfile,
  onConnect,
  onAccept,
  currentUserId,
  loading = false,
}: SuggestedStudentsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Gợi ý học tập hôm nay</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SuggestedStudentSkeleton />
          <SuggestedStudentSkeleton />
          <SuggestedStudentSkeleton />
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <AlertCircle size={24} />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">
          Hãy hoàn thiện hồ sơ để nhận gợi ý phù hợp hơn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Gợi ý học tập hôm nay</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {students.map((student) => {
          const match = Number(student.matchPercentage.toFixed(1));
          const safeMatch = Math.min(100, Math.max(0, match));
          const color = getMatchColor(match);
          const friendRequest = student.friendRequest;
          const initials = getInitials(student.fullName);
          const avatarBg = getAvatarColor(student.userId);

          const status = friendRequest?.status;
          const isAccepted = status === "ACCEPTED";
          const isFriendRequestSent = status === "FRIEND_REQUEST_SENT";
          const isSentByCurrentUser =
            friendRequest?.senderId != null &&
            currentUserId !== undefined &&
            friendRequest.senderId === currentUserId;
          const isReceivedByCurrentUser =
            friendRequest?.receiverId != null &&
            currentUserId !== undefined &&
            friendRequest.receiverId === currentUserId;

          const canSendFriendRequest =
            !friendRequest ||
            status === "NONE" ||
            status === "REJECTED" ||
            status === "SKIPPED" ||
            status === "VIEWED";
          const canAcceptFriendRequest = isFriendRequestSent && isReceivedByCurrentUser;

          const actionButton = (() => {
            if (isAccepted) {
              return {
                label: "Đã kết bạn",
                icon: <Check size={14} />,
                disabled: true,
                className: "border border-emerald-200 bg-emerald-50 text-emerald-600",
              };
            }

            if (isFriendRequestSent && isSentByCurrentUser) {
              return {
                label: "Đã gửi",
                icon: <Clock size={14} />,
                disabled: true,
                className: "border border-amber-200 bg-amber-50 text-amber-600",
              };
            }

            if (isFriendRequestSent && isReceivedByCurrentUser) {
              return {
                label: "Chấp nhận",
                icon: <Check size={14} />,
                disabled: false,
                className: "bg-emerald-500 text-white hover:bg-emerald-600",
              };
            }

            return {
              label: "Kết bạn",
              icon: <UserPlus size={14} />,
              disabled: false,
              className: "bg-orange-500 text-white hover:bg-orange-600",
            };
          })();

          return (
            <article
              key={student.userId}
              className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-3">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="h-11 w-11 shrink-0 rounded-full object-cover border border-gray-100"
                  />
                ) : (
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarBg} text-sm font-bold text-white`}
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-gray-800">
                    {student.fullName}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-gray-500 font-medium">
                    {student.studyModeLabel}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Phù hợp</span>
                  <span className={`text-xs font-bold ${color.text}`}>{match}%</span>
                </div>
                <div className={`h-1.5 overflow-hidden rounded-full ${color.track}`}>
                  <div
                    className={`h-full rounded-full ${color.bg} transition-all duration-500`}
                    style={{ width: `${safeMatch}%` }}
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-orange-50 px-2 py-2 text-center">
                  <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider">Điểm TB</p>
                  <p className="mt-0.5 text-xs font-extrabold text-gray-700">
                    {student.avgScore.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl bg-green-50 px-2 py-2 text-center">
                  <p className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Môn chung</p>
                  <p className="mt-0.5 text-xs font-extrabold text-gray-700">
                    {student.sharedSubjectCount}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 px-2 py-2 text-center">
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Tín chỉ</p>
                  <p className="mt-0.5 text-xs font-extrabold text-gray-700">
                    {student.studiedCredits}
                  </p>
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <button
                  type="button"
                  onClick={() => onViewProfile?.(student)}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <Eye size={13} />
                  Xem hồ sơ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (canAcceptFriendRequest && friendRequest) {
                      onAccept?.(friendRequest);
                      return;
                    }
                    if (canSendFriendRequest) {
                      onConnect?.(student.userId);
                    }
                  }}
                  disabled={actionButton.disabled}
                  className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors ${actionButton.className}`}
                >
                  {actionButton.icon}
                  {actionButton.label}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
