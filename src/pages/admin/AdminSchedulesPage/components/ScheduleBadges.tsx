import type { ScheduleStatus, StudyMode, ScheduleType } from "../types";

// ── Status badge ────────────────────────────────────────────────
const statusStyles: Record<ScheduleStatus, string> = {
  SCHEDULED: "bg-accent-50 text-accent-700",
  ONGOING: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-sage-50 text-sage-700",
  CANCELLED: "bg-rose-50 text-rose-700",
};

const statusLabels: Record<ScheduleStatus, string> = {
  SCHEDULED: "Sắp diễn ra",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

// ── Study mode badge ────────────────────────────────────────────
const modeStyles: Record<StudyMode, string> = {
  ONLINE: "bg-sky-50 text-sky-700",
  OFFLINE: "bg-sand-100 text-sand-700",
  HYBRID: "bg-violet-50 text-violet-700",
};

const modeLabels: Record<StudyMode, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

export function StudyModeBadge({ mode }: { mode: StudyMode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${modeStyles[mode]}`}
    >
      {modeLabels[mode]}
    </span>
  );
}

// ── Schedule type badge ─────────────────────────────────────────
const typeStyles: Record<ScheduleType, string> = {
  GROUP: "bg-accent-50 text-accent-700",
  ONE_ON_ONE: "bg-sand-100 text-sand-700",
};

const typeLabels: Record<ScheduleType, string> = {
  GROUP: "Học nhóm",
  ONE_ON_ONE: "Học 1-1",
};

export function ScheduleTypeBadge({ type }: { type: ScheduleType }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeStyles[type]}`}
    >
      {typeLabels[type]}
    </span>
  );
}
