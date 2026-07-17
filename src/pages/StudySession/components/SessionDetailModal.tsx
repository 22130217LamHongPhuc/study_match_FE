import { useEffect, useMemo, useState } from "react";
import type {
  SessionConfirmationStatsResponse,
  StudySessionVm,
  StudySessionResponse,
  JoinStudySessionResponse,
} from "../types";
import {
  getStudySessionById,
  getConfirmationStats,
  respondToStudySession,
  joinStudySession,
  cancelStudySession,
} from "../../../services/StudySessionService";
import { toast } from "react-toastify";
import {
  Clock,
  MapPin,
  Video,
  BookOpen,
  Users,
  User,
  X,
  AlertCircle,
  BarChart3,
  ExternalLink
} from "lucide-react";

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

function getSessionStatusLabel(status?: string | null) {
  if (status === "SCHEDULED") return "Đã lên lịch";
  if (status === "ONGOING") return "Đang diễn ra";
  if (status === "COMPLETED") return "Đã hoàn thành";
  if (status === "CANCELLED") return "Đã hủy";
  return status || "Chưa rõ";
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
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (status === "PENDING") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (status === "DECLINED") {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }
  return "bg-gray-50 text-gray-600 border-gray-100";
}

function hasSessionEnded(session: StudySessionVm | null) {
  if (!session) return false;
  const now = new Date();
  const endTime = new Date(session.endTime);
  return now > endTime;
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
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const userId = Number(localStorage.getItem("userId"));
  const isCreator = (currentSession?.createdByUserId || session?.createdByUserId) === userId;
  const isCancelled = (currentSession?.status || session?.status) === "CANCELLED";
  const isCompleted = (currentSession?.status || session?.status) === "COMPLETED";
  const startTimeVal = new Date(currentSession?.startTime || session?.startTime || 0).getTime();
  const canCancel = startTimeVal - now >= 5 * 60 * 1000;

  const showFooter =
    (currentSession?.participantStatus === "PENDING" && !isCancelled) ||
    (!hasSessionEnded(currentSession) &&
      ["ACCEPTED", "JOINED"].includes(currentSession?.participantStatus || "") &&
      currentSession?.studyMode !== "OFFLINE" &&
      !isCancelled) ||
    (isCreator && !isCancelled && !isCompleted && canCancel);

  const handleRespond = async (status: "ACCEPTED" | "DECLINED") => {
    if (!session) return;
    const userIdVal = Number(localStorage.getItem("userId"));
    if (!Number.isFinite(userIdVal) || userIdVal <= 0) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setResponding(status);
      setError("");
      const response = await respondToStudySession(session.id, userIdVal, status);
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
    const userIdVal = Number(localStorage.getItem("userId"));
    if (!Number.isFinite(userIdVal) || userIdVal <= 0) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }
    const startTime = new Date(session.startTime).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (startTime - currentTime > fiveMinutes) {
      toast.warning("Chỉ được tham gia trước giờ học 5 phút hoặc khi buổi học đang diễn ra.");
      return;
    }
    try {
      setJoining(true);
      setError("");
      const response = await joinStudySession(session.id, userIdVal);
      if (response.data) {
        onJoinSession?.(response.data);
      }
    } catch {
      setError("Không thể kết nối phòng học");
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!session || cancelling) return;
    const userIdVal = Number(localStorage.getItem("userId"));
    if (!Number.isFinite(userIdVal) || userIdVal <= 0) {
      setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }
    const currentStartTime = new Date(currentSession?.startTime || session.startTime).getTime();
    if (currentStartTime - Date.now() < 5 * 60 * 1000) {
      toast.error("Không thể hủy lịch học trước giờ bắt đầu dưới 5 phút.");
      return;
    }
    try {
      setCancelling(true);
      setError("");
      await cancelStudySession(session.id, userIdVal);
      toast.success("Hủy lịch học thành công.");
      onSessionUpdated?.({
        ...(currentSession || session),
        status: "CANCELLED" as any,
      });
      onClose();
    } catch {
      setError("Không thể hủy lịch học");
    } finally {
      setCancelling(false);
    }
  };

  if (!session) return null;

  const isGroup = (currentSession?.sessionType || session.sessionType) === "GROUP";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="relative w-full max-w-lg flex flex-col max-h-[90vh] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-start justify-between border-b border-gray-100 bg-white px-6 py-5 shrink-0">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isGroup ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
            }`}>
              {isGroup ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  {isGroup ? "Nhóm học" : "Cá nhân"}
                </span>
                {!isCancelled && (
                  <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                    {getParticipantStatusLabel(currentSession?.participantStatus || session.participantStatus)}
                  </span>
                )}
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isCancelled
                    ? "bg-red-50 border-red-100 text-red-600"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}>
                  {getSessionStatusLabel(currentSession?.status || session.status)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mt-1.5 leading-snug">
                {currentSession?.title || session.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <div className="text-xs font-semibold">{error}</div>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <div className="text-xs font-bold">Lịch học này đã bị hủy</div>
                <div className="text-[10px] text-red-700 mt-1">Buổi học đã được hủy bởi người tạo lịch học.</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-semibold text-gray-500">Đang tải thông tin chi tiết...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thời gian</span>
                    <div className="mt-1 text-sm font-bold text-gray-800">
                      {formatDateTime(currentSession?.startTime || session.startTime)}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      Đến: {formatDateTime(currentSession?.endTime || session.endTime)}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  {currentSession?.studyMode === "ONLINE" ? (
                    <Video className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hình thức</span>
                    <div className="mt-1 text-sm font-bold text-gray-800">
                      {getModeLabel(currentSession?.studyMode || session.studyMode)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                {isGroup ? (
                  <Users className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                ) : (
                  <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {isGroup ? "Nhóm học" : "Bạn học"}
                  </span>
                  <div className="mt-1 text-sm font-bold text-gray-800">
                    {isGroup
                      ? currentSession?.groupName || session.groupName || "Nhóm học"
                      : currentSession?.partnerName || session.partnerName || "Bạn học"}
                  </div>
                  {isGroup && (
                    <div className="mt-0.5 text-xs text-gray-500">
                      Quy mô: {currentSession?.membersCount || session.membersCount || 0} thành viên
                    </div>
                  )}
                </div>
              </div>

              {(currentSession?.location || currentSession?.meetingUrl || session.location || session.meetingUrl) && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  {currentSession?.studyMode === "ONLINE" ? (
                    <Video className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Địa điểm / Link học</span>
                    {(currentSession?.location || session.location) && (
                      <div className="mt-1 text-sm font-medium text-gray-800 break-words">
                        {currentSession?.location || session.location}
                      </div>
                    )}
                    {(currentSession?.meetingUrl || session.meetingUrl) && (
                      <div className="mt-2">
                        <a
                          href={currentSession?.meetingUrl || session.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Mở phòng học online
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(currentSession?.description || session.description) && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nội dung học</span>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">
                      {currentSession?.description || session.description}
                    </p>
                  </div>
                </div>
              )}

              {confirmationStats && (
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Trạng thái xác nhận
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {confirmationStats.sessionType === "USER_PAIR"
                            ? "Buổi học cá nhân 1-1"
                            : "Danh sách xác nhận thành viên"}
                        </div>
                      </div>
                    </div>
                    {loadingStats && (
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatCard
                      label="Tham gia"
                      value={confirmationStats.totalParticipants}
                    />
                    <StatCard
                      label="Đồng ý"
                      value={confirmationStats.acceptedCount}
                    />
                    <StatCard
                      label="Chờ"
                      value={confirmationStats.pendingCount}
                    />
                    <StatCard
                      label="Từ chối"
                      value={confirmationStats.declinedCount}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    {confirmationStats.otherParticipants.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-6 text-xs text-gray-400 text-center font-medium">
                        Chưa có dữ liệu xác nhận
                      </div>
                    ) : (
                      confirmationStats.otherParticipants.map((participant, index) => (
                        <div
                          key={`${participant.userId ?? participant.fullName ?? index}`}
                          className="flex items-center justify-between rounded-xl bg-gray-50/40 border border-gray-100 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                              {getParticipantName(participant).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-800">
                                {getParticipantName(participant)}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                <span>
                                  {participant.role === "PARTICIPANT" ? "Thành viên" : "Người tạo lịch"}
                                </span>
                                {participant.respondedAt && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span>{formatRespondedAt(participant.respondedAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(participant.status)}`}>
                            {getParticipantStatusLabel(participant.status || "")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showFooter && (
          <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3 shrink-0">
            {currentSession?.participantStatus === "PENDING" && !isCancelled && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {hasSessionEnded(currentSession) ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl bg-gray-100 border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-400 cursor-not-allowed"
                  >
                    Buổi học đã kết thúc
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRespond("ACCEPTED")}
                      disabled={responding !== null}
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-600/10"
                    >
                      {responding === "ACCEPTED" ? "Đang xử lý..." : "Xác nhận tham gia"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond("DECLINED")}
                      disabled={responding !== null}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                      {responding === "DECLINED" ? "Đang xử lý..." : "Từ chối"}
                    </button>
                  </>
                )}
              </div>
            )}

            {!hasSessionEnded(currentSession) &&
              ["ACCEPTED", "JOINED"].includes(currentSession?.participantStatus || "") &&
              currentSession?.studyMode !== "OFFLINE" &&
              !isCancelled && (
                <button
                  type="button"
                  onClick={handleJoinSession}
                  disabled={joining}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                >
                  {joining ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang kết nối...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Video className="h-4 w-4" />
                      Tham gia phòng học
                    </span>
                  )}
                </button>
              )}

            {isCreator && !isCancelled && !isCompleted && canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full rounded-xl px-5 py-2.5 text-xs font-bold transition-all border bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70"
              >
                {cancelling ? "Đang hủy..." : "Hủy buổi học"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2 text-center text-gray-600">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="mt-1 text-base font-bold text-gray-800">{value}</div>
    </div>
  );
}
