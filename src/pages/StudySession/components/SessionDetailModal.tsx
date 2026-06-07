import { type FormEvent, useEffect, useMemo, useState } from "react";
import type {
  SessionConfirmationStatsResponse,
  StudySessionVm,
  StudySessionResponse,
  JoinStudySessionResponse,
  FeedbackEligibilityResponse,
  FeedbackType,
  SubmitStudyFeedbackRequest,
} from "../types";
import {
  getStudySessionById,
  getConfirmationStats,
  respondToStudySession,
  joinStudySession,
  getFeedbackEligibility,
  submitStudyFeedback,
} from "../../../services/StudySessionService";

interface SessionDetailModalProps {
  session: StudySessionVm | null;
  onClose: () => void;
  onSessionUpdated?: (session: StudySessionVm) => void;
  onJoinSession?: (joinData: JoinStudySessionResponse) => void;
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
  if (status === "PARTIAL") return "Tham gia một phần";
  if (status === "COMPLETED") return "Hoàn thành";
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

  return "bg-gray-100 text-gray-600";
}

function hasSessionEnded(session?: {
  status?: string | null;
  endTime?: string | null;
} | null) {
  if (!session) return false;
  if (session.status === "COMPLETED") return true;
  if (!session.endTime) return false;

  const endTime = new Date(session.endTime).getTime();

  return Number.isFinite(endTime) && endTime <= Date.now();
}

export function SessionDetailModal({
  session,
  onClose,
  onSessionUpdated,
  onJoinSession,
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
  const [joining, setJoining] = useState(false);
  const [feedbackEligibility, setFeedbackEligibility] =
    useState<FeedbackEligibilityResponse | null>(null);
  const [loadingFeedbackEligibility, setLoadingFeedbackEligibility] =
    useState(false);

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

  const currentSession = useMemo<StudySessionVm | null>(() => {
    if (!detail || !session) return session;

    return {
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
        detail.partnerUserName ?? detail.partnerName ?? session.partnerName,
      groupName: detail.groupName ?? undefined,
      membersCount: detail.membersCount ?? undefined,
      subjectName: detail.subjectName ?? undefined,
    };
  }, [detail, session]);

  useEffect(() => {
    let mounted = true;

    async function loadFeedbackEligibility() {
      if (!currentSession || !hasSessionEnded(currentSession)) {
        setFeedbackEligibility(null);
        setLoadingFeedbackEligibility(false);
        return;
      }

      const userId = Number(localStorage.getItem("userId"));

      if (!Number.isFinite(userId) || userId <= 0) {
        setFeedbackEligibility(null);
        return;
      }

      try {
        setLoadingFeedbackEligibility(true);
        const response = await getFeedbackEligibility(currentSession.id, userId);

        if (!mounted) return;

        setFeedbackEligibility(response.data ?? null);
      } catch {
        if (!mounted) return;
        setFeedbackEligibility(null);
      } finally {
        if (mounted) {
          setLoadingFeedbackEligibility(false);
        }
      }
    }

    loadFeedbackEligibility();

    return () => {
      mounted = false;
    };
  }, [currentSession]);

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

  const handleJoinSession = async () => {
    if (!session || joining) return;

    const userId = Number(localStorage.getItem("userId"));
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setJoining(true);
      setError("");
      const response = await joinStudySession(session.id, userId);
      if (response.data) {
        onJoinSession?.(response.data);
      }
    } catch {
      setError("Không thể tham gia phòng học");
    } finally {
      setJoining(false);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="w-full h-[90vh] max-w-xl rounded-xl bg-white shadow-xl overflow-y-auto">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <div
              className={`mb-2 inline-flex rounded-md px-3 py-1 text-xs font-bold ${
                session.sessionType === "GROUP"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {session.sessionType === "GROUP"
                ? "Lịch học nhóm"
                : "Lịch học 1-1"}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {currentSession?.title || session.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {currentSession?.subjectName ||
                session.subjectName ||
                "Chưa cập nhật môn học"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-500">Thời gian</div>
            <div className="mt-1 font-bold text-gray-800">
              {formatDateTime(currentSession?.startTime || session.startTime)}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Kết thúc:{" "}
              {formatDateTime(currentSession?.endTime || session.endTime)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-500">
                Hình thức
              </div>
              <div className="mt-1 font-bold text-gray-800">
                {getModeLabel(currentSession?.studyMode || session.studyMode)}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-500">
                Trạng thái tham gia
              </div>
              <div className="mt-1 font-bold text-gray-800">
                {getParticipantStatusLabel(
                  currentSession?.participantStatus ||
                    session.participantStatus,
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-500">
              {currentSession?.sessionType === "GROUP" ||
              session.sessionType === "GROUP"
                ? "Nhóm học"
                : "Bạn học"}
            </div>
            <div className="mt-1 font-bold text-gray-800">
              {(currentSession?.sessionType || session.sessionType) === "GROUP"
                ? currentSession?.groupName || session.groupName || "Nhóm học"
                : currentSession?.partnerName ||
                  session.partnerName ||
                  "Bạn học"}
            </div>
            {(currentSession?.sessionType || session.sessionType) ===
              "GROUP" && (
              <div className="mt-1 text-sm text-gray-500">
                {currentSession?.membersCount || session.membersCount || 0}{" "}
                thành viên
              </div>
            )}
          </div>

          {(currentSession?.location ||
            currentSession?.meetingUrl ||
            session.location ||
            session.meetingUrl) && (
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-500">
                Địa điểm / Link học
              </div>
              {(currentSession?.location || session.location) && (
                <div className="mt-1 font-medium text-gray-800">
                  {currentSession?.location || session.location}
                </div>
              )}
              {(currentSession?.meetingUrl || session.meetingUrl) && (
                <a
                  href={currentSession?.meetingUrl || session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Mở phòng học online
                </a>
              )}
            </div>
          )}

          {(currentSession?.description || session.description) && (
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-500">
                Nội dung học
              </div>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                {currentSession?.description || session.description}
              </p>
            </div>
          )}

          {confirmationStats && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-500">
                    Thống kê xác nhận
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {confirmationStats.sessionType === "USER_PAIR"
                      ? "Buổi học 1-1"
                      : "Thống kê dành cho chủ nhóm"}
                  </div>
                </div>
                {loadingStats && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
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
                  <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Chưa có dữ liệu xác nhận
                  </div>
                ) : (
                  confirmationStats.otherParticipants.map(
                    (participant, index) => (
                      <div
                        key={`${participant.userId ?? participant.fullName ?? index}`}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {getParticipantName(participant)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.role === "PARTICIPANT"
                              ? "Thành viên"
                              : "Người tạo lịch"}
                          </div>
                          {participant.respondedAt && (
                            <div className="mt-1 text-xs text-gray-400">
                              Phản hồi:{" "}
                              {formatRespondedAt(participant.respondedAt)}
                            </div>
                          )}
                        </div>
                        <span
                          className={`rounded-md px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(participant.status)}`}
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

          {loadingFeedbackEligibility && hasSessionEnded(currentSession) && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-500">
              Đang kiểm tra phản hồi...
            </div>
          )}

          {feedbackEligibility?.sessionEnded &&
            feedbackEligibility.feedbackType && (
              <FeedbackEligibilityPanel eligibility={feedbackEligibility} />
            )}

          {(currentSession?.participantStatus || session.participantStatus) ===
            "PENDING" && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() => handleRespond("ACCEPTED")}
                disabled={responding !== null}
                className="flex-1 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                {responding === "ACCEPTED"
                  ? "Đang xử lý..."
                  : "Xác nhận tham gia"}
              </button>
              <button
                type="button"
                onClick={() => handleRespond("DECLINED")}
                disabled={responding !== null}
                className="flex-1 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {responding === "DECLINED" ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          )}

          {["ACCEPTED", "JOINED"].includes(
            currentSession?.participantStatus ||
              session.participantStatus ||
              "",
          ) &&
            (currentSession?.studyMode || session.studyMode) !== "OFFLINE" && (
              <div className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={handleJoinSession}
                  disabled={joining}
                  className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                >
                  {joining ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang kết nối...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                      </svg>
                      Tham gia phòng học
                    </span>
                  )}
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
  tone = "gray",
}: {
  label: string;
  value: number;
  tone?: "gray" | "emerald" | "amber" | "rose";
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "rose"
          ? "bg-rose-50 text-rose-700"
          : "bg-gray-100 text-gray-700";

  return (
    <div className={`rounded-xl px-3 py-3 ${toneClass}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function getFeedbackTitle(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") return "Đánh giá buổi học";
  if (type === "REPORT_PROBLEM") return "Báo sự cố";
  if (type === "EARLY_LEAVE_REASON") return "Lý do rời sớm";
  return "Phản hồi ngắn";
}

function FeedbackEligibilityPanel({
  eligibility,
}: {
  eligibility: FeedbackEligibilityResponse;
}) {
  const type = eligibility.feedbackType ?? "PARTIAL_FEEDBACK";

  if (!eligibility.feedbackType) return null;
  if (eligibility.sessionId > 0) {
    return <FeedbackSubmitPanel eligibility={eligibility} />;
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-orange-700">
            {getFeedbackTitle(type)}
          </div>
          <div className="mt-1 text-xs font-medium text-orange-700/80">
            {Math.round(eligibility.totalDurationSeconds / 60)} /{" "}
            {Math.round(eligibility.minRequiredDurationSeconds / 60)} phút
          </div>
        </div>
        {eligibility.eligibleForModel && (
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            AI model
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {type === "SESSION_FEEDBACK" && (
          <>
            <select className="w-full rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-400">
              <option value="">Mức độ hài lòng</option>
              <option value="5">Rất tốt</option>
              <option value="4">Tốt</option>
              <option value="3">Ổn</option>
              <option value="2">Chưa tốt</option>
              <option value="1">Không phù hợp</option>
            </select>
            <textarea
              rows={4}
              className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400"
              placeholder="Chia sẻ trải nghiệm buổi học"
            />
          </>
        )}

        {type === "REPORT_PROBLEM" && (
          <textarea
            rows={4}
            className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400"
            placeholder="Mô tả sự cố bạn gặp phải"
          />
        )}

        {type === "EARLY_LEAVE_REASON" && (
          <>
            <select className="w-full rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-400">
              <option value="">Chọn lý do</option>
              <option value="network">Mất kết nối</option>
              <option value="schedule">Có việc đột xuất</option>
              <option value="technical">Lỗi kỹ thuật</option>
              <option value="other">Lý do khác</option>
            </select>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400"
              placeholder="Bổ sung lý do"
            />
          </>
        )}

        {type === "PARTIAL_FEEDBACK" && (
          <textarea
            rows={3}
            className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400"
            placeholder="Phản hồi nhanh về phần bạn đã tham gia"
          />
        )}
      </div>
    </div>
  );
}

function getFeedbackHint(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") {
    return "Chia sẻ cảm nhận của bạn để cải thiện chất lượng ghép học.";
  }

  if (type === "REPORT_PROBLEM") {
    return "Ghi nhận vấn đề khiến bạn không thể tham gia buổi học.";
  }

  if (type === "EARLY_LEAVE_REASON") {
    return "Cho biết lý do bạn rời sớm để hệ thống xử lý attendance chính xác hơn.";
  }

  return "Gửi phản hồi ngắn cho phần thời gian bạn đã tham gia.";
}

function getFeedbackPlaceholder(type: FeedbackType) {
  if (type === "SESSION_FEEDBACK") {
    return "Bạn học cùng đúng giờ, trao đổi rõ ràng, phần học hiệu quả...";
  }

  if (type === "REPORT_PROBLEM") {
    return "Mô tả sự cố bạn gặp phải trong buổi học";
  }

  if (type === "EARLY_LEAVE_REASON") {
    return "Bổ sung thêm lý do nếu cần";
  }

  return "Phản hồi nhanh về phần bạn đã tham gia";
}

function getReasonLabel(reason: string) {
  if (reason === "network") return "Mất kết nối";
  if (reason === "schedule") return "Có việc đột xuất";
  if (reason === "technical") return "Lỗi kỹ thuật";
  if (reason === "other") return "Lý do khác";
  return "";
}

function FeedbackSubmitPanel({
  eligibility,
}: {
  eligibility: FeedbackEligibilityResponse;
}) {
  const type = eligibility.feedbackType;
  const [rating, setRating] = useState(5);
  const [matchedQualityScore, setMatchedQualityScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [studyEffectivenessScore, setStudyEffectivenessScore] = useState(5);
  const [reason, setReason] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!type) return null;

  const isFullFeedback = type === "SESSION_FEEDBACK";
  const isPartialFeedback = type === "PARTIAL_FEEDBACK";
  const canRate = isFullFeedback || isPartialFeedback;
  const durationMinutes = Math.round(eligibility.totalDurationSeconds / 60);
  const requiredMinutes = Math.round(
    eligibility.minRequiredDurationSeconds / 60,
  );

  const buildContent = () => {
    const trimmedContent = content.trim();

    if (type !== "EARLY_LEAVE_REASON") {
      return trimmedContent;
    }

    const reasonLabel = getReasonLabel(reason);

    return [reasonLabel ? `Lý do: ${reasonLabel}` : "", trimmedContent]
      .filter(Boolean)
      .join("\n");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!eligibility.canSubmitFeedback || submitted) return;

    const feedbackContent = buildContent();

    if (type === "EARLY_LEAVE_REASON" && !reason) {
      setSubmitError("Vui lòng chọn lý do rời sớm");
      return;
    }

    if (!feedbackContent) {
      setSubmitError("Vui lòng nhập nội dung phản hồi");
      return;
    }

    const payload: SubmitStudyFeedbackRequest = {
      sessionId: eligibility.sessionId,
      userId: eligibility.userId,
      targetUserId: eligibility.targetUserId,
      groupId: eligibility.groupId,
      sessionType: eligibility.sessionType,
      feedbackType: type,
      content: feedbackContent,
      eligibleForModel: eligibility.eligibleForModel,
      ...(canRate ? { rating } : {}),
      ...(isFullFeedback
        ? {
            matchedQualityScore,
            communicationScore,
            studyEffectivenessScore,
          }
        : {}),
      ...(isPartialFeedback ? { studyEffectivenessScore } : {}),
    };

    try {
      setSubmitting(true);
      setSubmitError("");
      await submitStudyFeedback(payload);
      setSubmitted(true);
    } catch {
      setSubmitError("Không thể gửi feedback. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-orange-200 bg-orange-50/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-gray-800">
            {getFeedbackTitle(type)}
          </div>
          <div className="mt-1 text-xs font-medium leading-5 text-gray-500">
            {getFeedbackHint(type)}
          </div>
        </div>
        {eligibility.eligibleForModel && (
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            AI model
          </span>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-gray-500">
        Thời lượng tham gia: {durationMinutes} / {requiredMinutes} phút
      </div>

      {!eligibility.canSubmitFeedback ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-500">
          Hiện tại bạn chưa thể gửi feedback cho buổi học này.
        </div>
      ) : submitted ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Feedback của bạn đã được gửi thành công.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {canRate && (
            <RatingPicker
              label={
                isFullFeedback
                  ? "Mức độ hài lòng chung"
                  : "Đánh giá phần đã tham gia"
              }
              value={rating}
              onChange={setRating}
            />
          )}

          {isFullFeedback && (
            <div className="grid grid-cols-1 gap-3">
              <ScoreRow
                label="Chất lượng ghép học"
                value={matchedQualityScore}
                onChange={setMatchedQualityScore}
              />
              <ScoreRow
                label="Giao tiếp"
                value={communicationScore}
                onChange={setCommunicationScore}
              />
              <ScoreRow
                label="Hiệu quả học"
                value={studyEffectivenessScore}
                onChange={setStudyEffectivenessScore}
              />
            </div>
          )}

          {isPartialFeedback && (
            <ScoreRow
              label="Hiệu quả phần đã học"
              value={studyEffectivenessScore}
              onChange={setStudyEffectivenessScore}
            />
          )}

          {type === "EARLY_LEAVE_REASON" && (
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-orange-400"
            >
              <option value="">Chọn lý do rời sớm</option>
              <option value="network">Mất kết nối</option>
              <option value="schedule">Có việc đột xuất</option>
              <option value="technical">Lỗi kỹ thuật</option>
              <option value="other">Lý do khác</option>
            </select>
          )}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={isFullFeedback ? 4 : 3}
            className="w-full resize-none rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-orange-400"
            placeholder={getFeedbackPlaceholder(type)}
          />

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi feedback"}
          </button>
        </div>
      )}
    </form>
  );
}

function RatingPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold text-gray-500">{label}</div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`h-9 rounded-lg border text-sm font-bold transition-colors ${
              value === score
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-orange-100 bg-white text-gray-600 hover:border-orange-300"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
          {value}/5
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-orange-500"
      />
    </div>
  );
}
