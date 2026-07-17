import type { MatchingActionStatus, StudySessionType } from "./types";

export const actionStatusLabel: Record<MatchingActionStatus, string> = {
  VIEWED: "Đã xem",
  FRIEND_REQUEST_SENT: "Đã gửi lời mời",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Đã từ chối",
};

export const actionStatusStyle: Record<MatchingActionStatus, string> = {
  VIEWED: "bg-sand-100 text-sand-700",
  FRIEND_REQUEST_SENT: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-sage-50 text-sage-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

export const sessionTypeLabel: Record<StudySessionType, string> = {
  USER_PAIR: "Học 1-1",
  GROUP: "Học nhóm",
};

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function formatPercentage(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
