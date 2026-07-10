import type { ReportResponse } from "../services/reportApi";

type ReportStatusLabelVariant = "admin" | "user";

const readValue = (
  report: ReportResponse | null | undefined,
  keys: string[],
): unknown => {
  if (!report) return null;

  return keys.reduce<unknown>((found, key) => {
    if (found !== null && found !== undefined && found !== "") return found;

    const value = report[key];
    if (value !== null && value !== undefined && value !== "") return value;

    return null;
  }, null);
};

const readNestedValue = (value: unknown, keys: string[]): unknown => {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  return keys.reduce<unknown>((found, key) => {
    if (found !== null && found !== undefined && found !== "") return found;

    const nested = record[key];
    if (nested !== null && nested !== undefined && nested !== "") return nested;

    return null;
  }, null);
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
};

export function getReportNumericId(
  report: ReportResponse | null | undefined,
): number | null {
  return toNumber(readValue(report, ["id", "reportId", "report_id"]));
}

export function getReportDisplayId(
  report: ReportResponse | null | undefined,
): string {
  const id = getReportNumericId(report);
  return id === null ? "--" : `#${id}`;
}

export function getReporterUserId(
  report: ReportResponse | null | undefined,
): number | null {
  const direct = toNumber(
    readValue(report, [
      "reporterUserId",
      "reporter_user_id",
      "reportedByUserId",
      "reported_by_user_id",
    ]),
  );

  if (direct !== null) return direct;

  const reporter = readValue(report, ["reporter", "reportedBy", "reporterInfo"]);
  return toNumber(readNestedValue(reporter, ["userId", "id", "user_id"]));
}

export function getReporterDisplay(
  report: ReportResponse | null | undefined,
): string {
  const reporter = readValue(report, ["reporter", "reportedBy", "reporterInfo"]);
  const reporterName = toText(
    readNestedValue(reporter, ["fullName", "name", "displayName", "username"]),
  );

  if (reporterName) return reporterName;

  const reporterUserId = getReporterUserId(report);
  return reporterUserId === null ? "--" : `User #${reporterUserId}`;
}

export function getTargetTypeValue(
  report: ReportResponse | null | undefined,
): string | null {
  return toText(readValue(report, ["targetType", "target_type"]));
}

export function getTargetIdValue(
  report: ReportResponse | null | undefined,
): number | null {
  return toNumber(readValue(report, ["targetId", "target_id"]));
}

export function getReasonValue(
  report: ReportResponse | null | undefined,
): string | null {
  return toText(readValue(report, ["reason"]));
}

export function getStatusValue(
  report: ReportResponse | null | undefined,
): string | null {
  return toText(readValue(report, ["status"]));
}

export function getDescriptionValue(
  report: ReportResponse | null | undefined,
): string {
  return toText(readValue(report, ["description"])) || "--";
}

export function getAdminNoteValue(
  report: ReportResponse | null | undefined,
): string {
  return (
    toText(readValue(report, ["adminNote", "admin_note", "reviewNote"])) ||
    "--"
  );
}

export function getCreatedAtValue(
  report: ReportResponse | null | undefined,
): string | null {
  return toText(readValue(report, ["createdAt", "created_at"]));
}

export function getUpdatedAtValue(
  report: ReportResponse | null | undefined,
): string | null {
  return toText(readValue(report, ["updatedAt", "updated_at"]));
}

export function getReportStatusLabel(
  status?: string | null,
  variant: ReportStatusLabelVariant = "admin",
): string {
  switch (status) {
    case "PENDING":
      return variant === "user" ? "Đang chờ xử lý" : "Chờ xử lý";
    case "REVIEWING":
      return "Đang xem xét";
    case "RESOLVED":
      return "Đã xử lý";
    case "REJECTED":
      return variant === "user" ? "Không vi phạm" : "Từ chối";
    case "CLOSED":
      return "Đã đóng";
    default:
      return status?.trim() || "--";
  }
}

export function getTargetTypeLabel(targetType?: string | null): string {
  switch (targetType) {
    case "USER":
      return "Người dùng";
    case "POST":
      return "Bài viết";
    case "GROUP":
      return "Nhóm";
    default:
      return targetType?.trim() || "--";
  }
}

export function getReasonLabel(reason?: string | null): string {
  switch (reason) {
    case "SPAM":
      return "Spam";
    case "HARASSMENT":
      return "Quấy rối";
    case "INAPPROPRIATE_CONTENT":
      return "Nội dung không phù hợp";
    case "FAKE_INFORMATION":
      return "Giả mạo thông tin";
    case "SCAM":
      return "Lừa đảo";
    case "CHEATING":
      return "Gian lận học tập";
    case "OTHER":
      return "Khác";
    default:
      return reason?.trim() || "--";
  }
}

export function getStatusBadgeClass(status?: string | null): string {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "REVIEWING":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "RESOLVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "CLOSED":
      return "border-sand-200 bg-sand-100 text-sand-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export function getTargetTypeBadgeClass(targetType?: string | null): string {
  switch (targetType) {
    case "USER":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "POST":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "GROUP":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
