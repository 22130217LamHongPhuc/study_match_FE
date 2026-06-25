import {
  User,
  MapPin,
  Target,
  BookOpen,
  CalendarDays,
  BarChart3,
  CircleCheckBig,
  Shield,
  NotebookPen,
  Rocket,
  Handshake,
  TrendingUp,
  Zap,
  Sprout,
  Sunrise,
  Sun,
  MoonStar,
} from "lucide-react";
import {
  Cohort,
  DayConfig,
  DayId,
  FreeTime,
  GoalConfig,
  ModeConfig,
  SlotConfig,
  StepMeta,
  StudyGoal,
  StudyMode,
  Subject,
  StudyPlan,
} from "./types";

export const LEARNING_LEVELS: GoalConfig[] = [
  {
    key: "Survivor",
    icon: Shield,
    title: "Cần củng cố nền tảng",
    desc: "Hiện tại bạn đang gặp khó khăn với môn học, cần nắm lại kiến thức cơ bản và tìm bạn học có thể hỗ trợ, giải thích khi cần.",
    ring: "ring-red-400",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  {
    key: "Passive Learner",
    icon: BookOpen,
    title: "Học ở mức cơ bản",
    desc: "Hiện tại bạn học theo lịch, chưa chủ động nhiều và cần bạn học cùng để nhắc nhở, tạo động lực, duy trì thói quen học tập.",
    ring: "ring-yellow-400",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    key: "Standard Learner",
    icon: NotebookPen,
    title: "Học ổn định",
    desc: "Hiện tại bạn có nền tảng khá ổn, học đều đặn và muốn tìm bạn để cùng thảo luận, ôn tập, chia sẻ tài liệu và tiến bộ hơn.",
    ring: "ring-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    key: "High Achiever",
    icon: Rocket,
    title: "Học tốt / định hướng điểm cao",
    desc: "Hiện tại bạn có năng lực học tập tốt, chủ động đặt mục tiêu cao và muốn kết nối với những bạn có cùng tinh thần phấn đấu.",
    ring: "ring-green-400",
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
];

export const VALID_MODES: Record<StudyGoal, StudyMode[]> = {
  Survivor: ["mutual_support", "peer_support", "challenge"],
  "Passive Learner": ["mutual_support", "peer_support", "challenge"],
  "Standard Learner": ["mutual_support", "peer_support", "support"],
  "High Achiever": ["mutual_support", "support"],
};

export const MODES: Record<StudyMode, ModeConfig> = {
  mutual_support: {
    icon: Handshake,
    label: "Học cùng bạn ngang trình độ",
    desc: "Ghép với những bạn có mức học tập gần giống bạn để dễ trao đổi, cùng ôn bài và tiến bộ từng bước.",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
  },

  peer_support: {
    icon: TrendingUp,
    label: "Học cùng bạn khá hơn",
    desc: "Ghép với những bạn học tốt hơn một chút để bạn có thêm định hướng, được hỗ trợ và cải thiện kết quả học tập.",
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
  },

  challenge: {
    icon: Zap,
    label: "Học cùng bạn học tốt",
    desc: "Ghép với những bạn có năng lực học tập nổi bật để tạo động lực, đặt mục tiêu cao hơn và phát triển bản thân.",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
  },

  support: {
    icon: Sprout,
    label: "Hỗ trợ bạn khác",
    desc: "Ghép với những bạn cần hỗ trợ hơn bạn, giúp bạn chia sẻ kiến thức, ôn lại bài và học chắc hơn.",
    bg: "bg-teal-50",
    border: "border-teal-300",
    text: "text-teal-700",
  },
};

export const DAYS: DayConfig[] = [
  { id: 0, label: "Thứ Hai", short: "T2" },
  { id: 1, label: "Thứ Ba", short: "T3" },
  { id: 2, label: "Thứ Tư", short: "T4" },
  { id: 3, label: "Thứ Năm", short: "T5" },
  { id: 4, label: "Thứ Sáu", short: "T6" },
  { id: 5, label: "Thứ Bảy", short: "T7" },
  { id: 6, label: "Chủ Nhật", short: "CN" },
];

export const SLOTS: SlotConfig[] = [
  { id: "ca1", label: "Ca 1", time: "7h00–9h15", icon: Sunrise },
  { id: "ca2", label: "Ca 2", time: "9h30–11h45", icon: Sunrise },
  { id: "ca3", label: "Ca 3", time: "12h15–14h30", icon: Sun },
  { id: "ca4", label: "Ca 4", time: "14h50–17h05", icon: Sun },
  { id: "ca5", label: "Ca 5", time: "17h30–19h45", icon: MoonStar },
  { id: "ca6", label: "Ca 6", time: "20h00–21h45", icon: MoonStar },
];

export const STEPS_META: StepMeta[] = [
  { id: 1, label: "Thông tin cơ bản", icon: User },
  { id: 2, label: "Nhân khẩu học", icon: MapPin },
  { id: 3, label: "Mục tiêu học tập", icon: Target },
  { id: 4, label: "Môn đang học", icon: BookOpen },
  { id: 5, label: "Thời gian rảnh", icon: CalendarDays },
  { id: 6, label: "Kết quả học tập", icon: BarChart3 },
  { id: 7, label: "Xác nhận", icon: CircleCheckBig },
];

export const initFreeTime = (): FreeTime =>
  Object.fromEntries(
    DAYS.map((d) => [
      d.id,
      Object.fromEntries(SLOTS.map((slot) => [slot.id, false])),
    ]),
  ) as FreeTime;

export function normalizeModuleSchedule(existing?: FreeTime): FreeTime {
  const normalized = initFreeTime();
  if (!existing) return normalized;

  DAYS.forEach((day) => {
    normalized[day.id] = {
      ...normalized[day.id],
      ...(existing[day.id] || {}),
    };
  });

  return normalized;
}

export function syncModuleSlots(
  currentSlots: Record<string, FreeTime>,
  selectedModuleCodes: string[],
): Record<string, FreeTime> {
  return Object.fromEntries(
    selectedModuleCodes.map((code) => {
      const existing = currentSlots[code];
      return [code, normalizeModuleSchedule(existing)];
    }),
  );
}

export function getSortedSubjects(subjects: Subject[] = []): Subject[] {
  return [...subjects].sort((a, b) => {
    const orderDiff = (a.recommendedOrder ?? 0) - (b.recommendedOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return String(a.subjectCode).localeCompare(String(b.subjectCode));
  });
}

export function getSubjectLabel(subject: Subject | undefined): string {
  if (!subject) return "";
  return `${subject.subjectCode} - ${subject.subjectName}`;
}

export function getCohortLabel(cohort: Cohort): string {
  if (!cohort) return "";
  return `Khóa ${cohort.cohortCode} • Bắt đầu ${cohort.startAcademicYear}`;
}

export function getStudyPlanTitle(plan: StudyPlan): string {
  if (!plan) return "";
  return (
    plan.termFullName ||
    `Học kỳ ${plan.semesterNo} - Năm học ${plan.academicYearStart} - ${plan.academicYearEnd}`
  );
}
