import {
  Check,
  Clock,
  Eye,
  LoaderCircle,
  Send,
  ShieldX,
  UserPlus,
} from "lucide-react";
import {
  FriendRequestVm,
  RecommendationCardVm,
  RecommendationSecondaryAction,
} from "../types";

interface RecommendationCardProps {
  recommendation: RecommendationCardVm;
  onViewProfile?: (recommendation: RecommendationCardVm) => void;
  onConnect?: (id: number) => void;
  onAccept?: (request: FriendRequestVm) => void;
  onSecondaryAction?: (
    recommendation: RecommendationCardVm,
    action: RecommendationSecondaryAction,
  ) => void;
  isConnecting?: boolean;
  isAccepting?: boolean;
  isRejecting?: boolean;
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

export default function RecommendationCard({
  recommendation,
  onViewProfile,
  onConnect,
  onAccept,
  onSecondaryAction,
  isConnecting = false,
  isAccepting = false,
  isRejecting = false,
  currentUserId,
}: RecommendationCardProps) {
  const match = Number(recommendation.matchPercentage.toFixed(1));
  const safeMatch = Math.min(100, Math.max(0, match));
  const color = getMatchColor(match);
  const friendRequest = recommendation.friendRequest;
  const initials = getInitials(recommendation.fullName);
  const avatarBg = getAvatarColor(recommendation.userId);

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
    !friendRequest || status === "NONE" || status === "REJECTED" || status === "SKIPPED" || status === "VIEWED";
  const canAcceptFriendRequest = isFriendRequestSent && isReceivedByCurrentUser;

  const actionButton = (() => {
    if (isAccepted) {
      return {
        label: "Đã kết bạn",
        icon: <Check size={15} />,
        disabled: true,
        className:
          "border border-emerald-200 bg-emerald-50 text-emerald-600",
      };
    }

    if (isFriendRequestSent && isSentByCurrentUser) {
      return {
        label: "Đã gửi",
        icon: <Clock size={15} />,
        disabled: true,
        className: "border border-amber-200 bg-amber-50 text-amber-600",
      };
    }

    if (isFriendRequestSent && isReceivedByCurrentUser) {
      return {
        label: isAccepting ? "Đang xử lý..." : "Chấp nhận",
        icon: <Check size={15} />,
        disabled: isAccepting,
        className:
          "bg-emerald-500 text-white transition-colors hover:bg-emerald-600",
      };
    }

    return {
      label: isConnecting ? "Đang gửi..." : "Kết bạn",
      icon: isConnecting ? (
        <Send size={15} className="animate-pulse" />
      ) : (
        <UserPlus size={15} />
      ),
      disabled:
        isConnecting || (!canSendFriendRequest && !canAcceptFriendRequest),
      className:
        "bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50",
    };
  })();

  const secondaryButton = (() => {
    if (isAccepted) return null;

    if (isFriendRequestSent && isSentByCurrentUser) {
      return {
        action: "CANCEL_REQUEST" as const,
        label: isRejecting ? "Đang xử lý..." : "Hủy lời mời",
      };
    }

    if (isFriendRequestSent && isReceivedByCurrentUser) {
      return {
        action: "REJECTED" as const,
        label: isRejecting ? "Đang xử lý..." : "Từ chối",
      };
    }

    if (canSendFriendRequest) {
      return {
        action: "SKIPPED" as const,
        label: isRejecting ? "Đang gửi..." : "Bỏ qua",
      };
    }

    return null;
  })();

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${avatarBg} text-sm font-bold text-white`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-800">
            {recommendation.fullName ?? "Không xác định"}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {recommendation.studyModeLabel}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
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

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-orange-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-orange-400">Điểm TB</p>
          <p className="mt-0.5 text-sm font-bold text-gray-700">
            {recommendation.avgScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl bg-green-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-green-500">Môn chung</p>
          <p className="mt-0.5 text-sm font-bold text-gray-700">
            {recommendation.sharedSubjectCount}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 px-2 py-2 text-center">
          <p className="text-[10px] font-medium text-amber-500">Tín chỉ</p>
          <p className="mt-0.5 text-sm font-bold text-gray-700">
            {recommendation.studiedCredits}
          </p>
        </div>
      </div>

      {/* <div className="mb-4">
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {recommendation.studyGoal}
        </span>
      </div> */}

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => onViewProfile?.(recommendation)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Eye size={15} />
          Xem hồ sơ
        </button>

        <div
          className={`grid gap-2 ${secondaryButton ? "grid-cols-2" : "grid-cols-1"}`}
        >
          <button
            type="button"
            onClick={() => {
              if (canAcceptFriendRequest && friendRequest?.id) {
                onAccept?.(friendRequest);
                return;
              }

              if (canSendFriendRequest) {
                onConnect?.(recommendation.userId);
              }
            }}
            disabled={actionButton.disabled || isRejecting}
            className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold ${actionButton.className}`}
          >
            {actionButton.icon}
            {actionButton.label}
          </button>

          {secondaryButton && (
            <button
              type="button"
              onClick={() =>
                onSecondaryAction?.(recommendation, secondaryButton.action)
              }
              disabled={isRejecting || isConnecting || isAccepting}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRejecting ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <ShieldX size={15} />
              )}
              {secondaryButton.label}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
