import { useEffect, useState } from "react";
import type {
  SessionConfirmationStatsResponse,
  StudySessionVm,
  StudySessionResponse,
} from "../types";
import {
  getStudySessionById,
  getConfirmationStats,
  respondToStudySession,
} from "../../../services/StudySessionService";

interface SessionDetailModalProps {
  session: StudySessionVm | null;
  onClose: () => void;
  onSessionUpdated?: (session: StudySessionVm) => void;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getParticipantStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "ACCEPTED") return "Đã xác nhận";
  if (status === "JOINED") return "Đã tham gia";
  if (status === "DECLINED") return "Đã từ chối";
  if (status === "ABSENT") return "Vắng mặt";
  return status;
}

function getModeLabel(mode: string) {
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Trực tiếp";
  return "Kết hợp";
}

function mapResponseToVm(
  response: StudySessionResponse,
  fallback: StudySessionVm,
): StudySessionVm {
  return {
    ...fallback,
    id: response.id,
    sessionType: response.sessionType,
    groupId: response.groupId,
    title: response.title,
    description: response.description ?? undefined,
    startTime: response.startTime,
    endTime: response.endTime,
    studyMode: response.studyMode,
    location: response.location ?? undefined,
    meetingUrl: response.meetingUrl ?? undefined,
    createdByUserId: response.createdByUserId,
    status: response.status,
    participantStatus: response.participantStatus,
    partnerName:
      response.partnerUserName ?? response.partnerName ?? fallback.partnerName,
    groupName: response.groupName ?? undefined,
    membersCount: response.membersCount ?? undefined,
    subjectName: response.subjectName ?? undefined,
  };
}

function getParticipantName(participant: {
  userName?: string | null;
  fullName?: string | null;
  partnerUserName?: string | null;
}) {
  return (
    participant.fullName ||
    participant.userName ||
    participant.partnerUserName ||
    "Bạn học"
  );
}

function formatRespondedAt(value?: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeClass(status?: string | null) {
  if (status === "ACCEPTED" || status === "JOINED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "DECLINED") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-600";
}

export function SessionDetailModal({
  session,
  onClose,
  onSessionUpdated,
}: SessionDetailModalProps) {
  const [detail, setDetail] = useState<StudySessionResponse | null>(null);
  const [confirmationStats, setConfirmationStats] =
    useState<SessionConfirmationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState<"ACCEPTED" | "DECLINED" | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!session) {
        setDetail(null);
        setError("");
        setLoading(false);
        return;
      }

      setDetail(null);
      setError("");

      const userId = Number(localStorage.getItem("userId"));

      if (!Number.isFinite(userId) || userId <= 0) {
        setDetail(null);
        setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      try {
        setLoading(true);

        const response = await getStudySessionById(session.id, userId);

        if (!mounted) return;

        setDetail(response.data);
      } catch {
        if (!mounted) return;
        setDetail(null);
        setError("Không thể tải chi tiết lịch học");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [session?.id]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      if (!session) {
        setConfirmationStats(null);
        setLoadingStats(false);
        return;
      }

      const userId = Number(localStorage.getItem("userId"));

      if (!Number.isFinite(userId) || userId <= 0) {
        setConfirmationStats(null);
        return;
      }

      const canViewStats =
        session.sessionType === "USER_PAIR" ||
        session.createdByUserId === userId;

      if (!canViewStats) {
        setConfirmationStats(null);
        return;
      }

      try {
        setLoadingStats(true);

        const response = await getConfirmationStats(session.id, userId);

        if (!mounted) return;

        setConfirmationStats(response.data);
      } catch {
        if (!mounted) return;
        setConfirmationStats(null);
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, [session?.id, session?.sessionType, session?.createdByUserId]);

  const currentSession = detail
    ? {
        ...session,
        sessionType: detail.sessionType,
        groupId: detail.groupId,
        title: detail.title,
        description: detail.description ?? undefined,
        startTime: detail.startTime,
        endTime: detail.endTime,
        studyMode: detail.studyMode,
        location: detail.location ?? undefined,
        meetingUrl: detail.meetingUrl ?? undefined,
        createdByUserId: detail.createdByUserId,
        status: detail.status,
        participantStatus: detail.participantStatus,
        partnerName:
          detail.partnerUserName ?? detail.partnerName ?? session?.partnerName,
        groupName: detail.groupName ?? undefined,
        membersCount: detail.membersCount ?? undefined,
        subjectName: detail.subjectName ?? undefined,
      }
    : session;

  const handleRespond = async (status: "ACCEPTED" | "DECLINED") => {
    if (!session) return;

    const userId = Number(localStorage.getItem("userId"));

    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setResponding(status);
      setError("");

      const response = await respondToStudySession(session.id, userId, status);

      if (response.data) {
        setDetail(response.data);
        const updatedSession = mapResponseToVm(response.data, session);
        onSessionUpdated?.(updatedSession);
      }

      if (session) {
        const statsUserId = Number(localStorage.getItem("userId"));
        if (Number.isFinite(statsUserId) && statsUserId > 0) {
          const statsResponse = await getConfirmationStats(
            session.id,
            statsUserId,
          );
          setConfirmationStats(statsResponse.data);
        }
      }
    } catch {
      setError("Không thể gửi phản hồi cho lịch học");
    } finally {
      setResponding(null);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full h-[90vh] max-w-xl rounded-3xl bg-white shadow-xl overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div
              className={`mb-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                session.sessionType === "GROUP"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {session.sessionType === "GROUP"
                ? "Lịch học nhóm"
                : "Lịch học 1-1"}
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentSession?.title || session.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {currentSession?.subjectName ||
                session.subjectName ||
                "Chưa cập nhật môn học"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4 p-6">
          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">
              Thời gian
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {formatDateTime(currentSession?.startTime || session.startTime)}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Kết thúc:{" "}
              {formatDateTime(currentSession?.endTime || session.endTime)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Hình thức
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {getModeLabel(currentSession?.studyMode || session.studyMode)}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Trạng thái tham gia
              </div>
              <div className="mt-1 font-bold text-slate-900">
                {getParticipantStatusLabel(
                  currentSession?.participantStatus ||
                    session.participantStatus,
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-500">
              {currentSession?.sessionType === "GROUP" ||
              session.sessionType === "GROUP"
                ? "Nhóm học"
                : "Bạn học"}
            </div>
            <div className="mt-1 font-bold text-slate-900">
              {(currentSession?.sessionType || session.sessionType) === "GROUP"
                ? currentSession?.groupName || session.groupName || "Nhóm học"
                : currentSession?.partnerName ||
                  session.partnerName ||
                  "Bạn học"}
            </div>
            {(currentSession?.sessionType || session.sessionType) ===
              "GROUP" && (
              <div className="mt-1 text-sm text-slate-500">
                {currentSession?.membersCount || session.membersCount || 0}{" "}
                thành viên
              </div>
            )}
          </div>

          {(currentSession?.location ||
            currentSession?.meetingUrl ||
            session.location ||
            session.meetingUrl) && (
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Địa điểm / Link học
              </div>
              {(currentSession?.location || session.location) && (
                <div className="mt-1 font-medium text-slate-900">
                  {currentSession?.location || session.location}
                </div>
              )}
              {(currentSession?.meetingUrl || session.meetingUrl) && (
                <a
                  href={currentSession?.meetingUrl || session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Mở phòng học online
                </a>
              )}
            </div>
          )}

          {(currentSession?.description || session.description) && (
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-500">
                Nội dung học
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {currentSession?.description || session.description}
              </p>
            </div>
          )}

          {confirmationStats && (
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-500">
                    Thống kê xác nhận
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {confirmationStats.sessionType === "USER_PAIR"
                      ? "Buổi học 1-1"
                      : "Thống kê dành cho chủ nhóm"}
                  </div>
                </div>
                {loadingStats && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    Đang tải...
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Tổng người tham gia"
                  value={confirmationStats.totalParticipants}
                />
                <StatCard
                  label="Đã xác nhận"
                  value={confirmationStats.acceptedCount}
                  tone="emerald"
                />
                <StatCard
                  label="Chờ phản hồi"
                  value={confirmationStats.pendingCount}
                  tone="amber"
                />
                <StatCard
                  label="Từ chối"
                  value={confirmationStats.declinedCount}
                  tone="rose"
                />
              </div>

              <div className="mt-4 space-y-2">
                {confirmationStats.otherParticipants.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Chưa có dữ liệu xác nhận
                  </div>
                ) : (
                  confirmationStats.otherParticipants.map(
                    (participant, index) => (
                      <div
                        key={`${participant.userId ?? participant.fullName ?? index}`}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {getParticipantName(participant)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {participant.role === "PARTICIPANT"
                              ? "Thành viên"
                              : "Người tạo lịch"}
                          </div>
                          {participant.respondedAt && (
                            <div className="mt-1 text-xs text-slate-400">
                              Phản hồi:{" "}
                              {formatRespondedAt(participant.respondedAt)}
                            </div>
                          )}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(participant.status)}`}
                        >
                          {getParticipantStatusLabel(participant.status || "")}
                        </span>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          )}

          {(currentSession?.participantStatus || session.participantStatus) ===
            "PENDING" && (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => handleRespond("ACCEPTED")}
                disabled={responding !== null}
                className="flex-1 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
              >
                {responding === "ACCEPTED"
                  ? "Đang xử lý..."
                  : "Xác nhận tham gia"}
              </button>
              <button
                type="button"
                onClick={() => handleRespond("DECLINED")}
                disabled={responding !== null}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {responding === "DECLINED" ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "amber" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "rose"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-2xl px-3 py-3 ${toneClass}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
