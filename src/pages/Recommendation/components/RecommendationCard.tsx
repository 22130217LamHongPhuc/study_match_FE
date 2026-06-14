import { UserPlus, Check, Clock, Ban, Send, Eye } from "lucide-react";
import { FriendRequestVm, RecommendationCardVm } from "../types";

interface RecommendationCardProps {
  recommendation: RecommendationCardVm;
  onViewProfile?: (recommendation: RecommendationCardVm) => void;
  onConnect?: (id: number) => void;
  onAccept?: (request: FriendRequestVm) => void;
  isConnecting?: boolean;
  isAccepting?: boolean;
  currentUserId?: number;
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
  if (match >= 70) return { text: "text-emerald-600", bg: "bg-emerald-500", track: "bg-emerald-100" };
  if (match >= 50) return { text: "text-orange-600", bg: "bg-orange-500", track: "bg-orange-100" };
  return { text: "text-amber-600", bg: "bg-amber-500", track: "bg-amber-100" };
}

export default function RecommendationCard({
  recommendation,
  onViewProfile,
  onConnect,
  onAccept,
  isConnecting = false,
  isAccepting = false,
  currentUserId,
}: RecommendationCardProps) {
  const match = Number(recommendation.matchPercentage.toFixed(1));
  const safeMatch = Math.min(100, Math.max(0, match));
  const color = getMatchColor(match);
  const friendRequest = recommendation.friendRequest;
  const initials = getInitials(recommendation.fullName);
  const avatarBg = getAvatarColor(recommendation.userId);

  const status = friendRequest?.status;
  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const isBlocked = status === "BLOCKED";
  const isSentByCurrentUser =
    friendRequest?.senderId !== undefined &&
    currentUserId !== undefined &&
    friendRequest.senderId === currentUserId;
  const isReceivedByCurrentUser =
    friendRequest?.receiverId !== undefined &&
    currentUserId !== undefined &&
    friendRequest.receiverId === currentUserId;

  const canSendFriendRequest = !friendRequest || isRejected;
  const canAcceptFriendRequest = isPending && isReceivedByCurrentUser;

  const actionButton = (() => {
    if (isApproved) {
      return {
        label: "Đã kết bạn",
        icon: <Check size={15} />,
        disabled: true,
        className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      };
    }
    if (isBlocked) {
      return {
        label: "Đã chặn",
        icon: <Ban size={15} />,
        disabled: true,
        className: "bg-gray-100 text-gray-400 border border-gray-200",
      };
    }
    if (isPending && isSentByCurrentUser) {
      return {
        label: "Đã gửi",
        icon: <Clock size={15} />,
        disabled: true,
        className: "bg-amber-50 text-amber-600 border border-amber-200",
      };
    }
    if (isPending && isReceivedByCurrentUser) {
      return {
        label: isAccepting ? "Đang xử lý..." : "Chấp nhận",
        icon: <Check size={15} />,
        disabled: isAccepting,
        className: "bg-emerald-500 text-white hover:bg-emerald-600 transition-colors",
      };
    }
    return {
      label: isConnecting ? "Đang gửi..." : isRejected ? "Gửi lại" : "Kết bạn",
      icon: isConnecting ? <Send size={15} className="animate-pulse" /> : <UserPlus size={15} />,
      disabled: isConnecting || (!canSendFriendRequest && !canAcceptFriendRequest),
      className: "bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    };
  })();

  return (
    <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarBg} text-white font-bold text-sm`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-gray-800 truncate">
            {recommendation.fullName ?? "Không xác định"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {recommendation.studyModeLabel}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500">Phù hợp</span>
          <span className={`text-sm font-bold ${color.text}`}>{match}%</span>
        </div>
        <div className={`h-2 overflow-hidden rounded-full ${color.track}`}>
          <div
            className={`h-full rounded-full ${color.bg} transition-all duration-500`}
            style={{ width: `${safeMatch}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-orange-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-orange-400">Điểm TB</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">
            {recommendation.avgScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-green-500">Môn chung</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">
            {recommendation.sharedSubjectCount}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-amber-500">Tín chỉ</p>
          <p className="text-sm font-bold text-gray-700 mt-0.5">
            {recommendation.studiedCredits}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {recommendation.studyGoal}
        </span>
      </div>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => onViewProfile?.(recommendation)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Eye size={15} />
          Xem hồ sơ
        </button>
        <button
          type="button"
          onClick={() => {
            if (canAcceptFriendRequest && friendRequest?.id) {
              onAccept?.(friendRequest);
              return;
            }
            onConnect?.(recommendation.userId);
          }}
          disabled={actionButton.disabled}
          className={`flex w-full items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold ${actionButton.className}`}
        >
          {actionButton.icon}
          {actionButton.label}
        </button>
      </div>
    </article>
  );
}
