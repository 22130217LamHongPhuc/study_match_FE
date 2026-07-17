import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HeaderCard } from "./components/HeaderCard";
import { QuickStats } from "./components/QuickStats";
import { FilterTabs } from "./components/FilterTabs";
import { WeeklyCalendar } from "./components/WeeklyCalendar";
import { TodaySessionList } from "./components/TodaySessionList";
import { AllSessionList } from "./components/AllSessionList";
import { CreateSessionModal } from "./components/CreateSessionModal";
import { SessionDetailModal } from "./components/SessionDetailModal";
import { StudySessionRoom } from "./components/StudySessionRoom";
import FeedbackSubmitPanel from "./components/FeedbackModal";
import type { ScheduleFilter, StudySessionVm } from "./types";
import {
  getFeedbackEligibility,
  getStudySessionById,
  getUserStudySessions,
} from "../../services/StudySessionService";
import type {
  PageResponse,
  UserStudySessionParams,
} from "../../services/StudySessionService";
import {
  getFriendsListService,
  type FriendListItem,
} from "../../services/FriendService";
import type {
  FeedbackEligibilityResponse,
  JoinStudySessionResponse,
  StudySessionResponse,
} from "./types";

const DEFAULT_SESSION_PAGE_SIZE = 10;
const CALENDAR_SESSION_PAGE_SIZE = 200;
const SESSION_PAGE_SIZE_OPTIONS = [10, 20, 50];

function createEmptyPage<T>(
  size = DEFAULT_SESSION_PAGE_SIZE,
  page = 0,
): PageResponse<T> {
  return {
    content: [],
    empty: true,
    first: true,
    last: true,
    number: page,
    numberOfElements: 0,
    size,
    totalElements: 0,
    totalPages: 0,
  };
}

function toLocalDateTimeParam(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 19);
}

function getCurrentWeekRange() {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setHours(0, 0, 0, 0);

  return {
    startFrom: toLocalDateTimeParam(startOfWeek),
    startTo: toLocalDateTimeParam(endOfWeek),
  };
}

function getSessionParamsByFilter(
  filter: ScheduleFilter,
): Pick<UserStudySessionParams, "sessionType" | "participantStatus"> {
  if (filter === "USER_PAIR" || filter === "GROUP") {
    return { sessionType: filter };
  }

  if (filter === "PENDING") {
    return { participantStatus: "PENDING" };
  }

  return {};
}

function matchesFilter(session: StudySessionVm, filter: ScheduleFilter) {
  if (filter === "ALL") return true;
  if (filter === "PENDING") return session.participantStatus === "PENDING";
  return session.sessionType === filter;
}

function isSessionInCurrentWeek(session: StudySessionVm) {
  const { startFrom, startTo } = getCurrentWeekRange();
  return session.startTime >= startFrom && session.startTime < startTo;
}

function resolvePartnerName(
  session: StudySessionResponse,
  friendsById: Map<number, FriendListItem>,
) {
  const partnerName = session.partnerUserName ?? session.partnerName;

  if (!partnerName) return undefined;

  if (session.partnerUserName) {
    return session.partnerUserName;
  }

  const match = partnerName.match(/^User\s*#(\d+)$/i);
  if (!match) return partnerName;

  const friendId = Number(match[1]);
  const friend = friendsById.get(friendId);

  return friend?.full_name || partnerName;
}

function mapSessionToVm(
  session: StudySessionResponse,
  friendsById: Map<number, FriendListItem>,
): StudySessionVm {
  return {
    id: session.id,
    sessionType: session.sessionType,
    groupId: session.groupId,
    title: session.title,
    description: session.description ?? undefined,
    startTime: session.startTime,
    endTime: session.endTime,
    studyMode: session.studyMode,
    location: session.location ?? undefined,
    meetingUrl: session.meetingUrl ?? undefined,
    createdByUserId: session.createdByUserId,
    status: session.status,
    participantStatus: session.participantStatus,
    partnerName: resolvePartnerName(session, friendsById),
    groupName: session.groupName ?? undefined,
    membersCount: session.membersCount ?? undefined,
    subjectName: session.subjectName ?? undefined,
  };
}

function applySessionUpdate(
  sessions: StudySessionVm[],
  updatedSession: StudySessionVm,
  filter: ScheduleFilter,
) {
  if (!matchesFilter(updatedSession, filter)) {
    return sessions.filter((session) => session.id !== updatedSession.id);
  }

  return sessions.map((session) =>
    session.id === updatedSession.id ? updatedSession : session,
  );
}

export default function StudySessionPage() {
  const [sessions, setSessions] = useState<StudySessionVm[]>([]);
  const [calendarSessions, setCalendarSessions] = useState<StudySessionVm[]>(
    [],
  );
  const [sessionPage, setSessionPage] = useState<
    PageResponse<StudySessionResponse>
  >(createEmptyPage());
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_SESSION_PAGE_SIZE);
  const [filter, setFilter] = useState<ScheduleFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySessionVm | null>(
    null,
  );
  const [joinedRoom, setJoinedRoom] = useState<JoinStudySessionResponse | null>(
    null,
  );
  const [joinedSession, setJoinedSession] = useState<StudySessionVm | null>(
    null,
  );
  const [feedbackEligibility, setFeedbackEligibility] =
    useState<FeedbackEligibilityResponse | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const currentUserId = Number(localStorage.getItem("userId"));
  const querySessionId = searchParams.get("sessionId");

  const currentUserName =
    localStorage.getItem("fullName") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "";

  const handleFilterChange = (nextFilter: ScheduleFilter) => {
    setFilter(nextFilter);
    setPage(0);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setReloadTrigger((prev) => prev + 1);
    };
    window.addEventListener("study_session_updated", handleUpdate);
    return () => {
      window.removeEventListener("study_session_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (querySessionId && Number.isFinite(currentUserId) && currentUserId > 0) {
      const sessionIdNum = Number(querySessionId);
      if (sessionIdNum > 0) {
        getStudySessionById(sessionIdNum, currentUserId)
          .then((res) => {
            if (res.data) {
              const mapped = mapSessionToVm(res.data, new Map());
              setSelectedSession(mapped);
              searchParams.delete("sessionId");
              setSearchParams(searchParams, { replace: true });
            }
          })
          .catch((err) => {
            console.error("Lỗi khi tải chi tiết lịch học từ URL:", err);
          });
      }
    }
  }, [querySessionId, currentUserId]);

  useEffect(() => {
    let mounted = true;

    async function loadSessions() {
      if (!Number.isFinite(currentUserId) || currentUserId <= 0) {
        if (mounted) {
          setSessions([]);
          setCalendarSessions([]);
          setSessionPage(createEmptyPage(pageSize, page));
          setSessionError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
          setLoadingSessions(false);
        }
        return;
      }

      try {
        setLoadingSessions(true);
        setSessionError("");

        const filterParams = getSessionParamsByFilter(filter);
        const weekRange = getCurrentWeekRange();

        const [sessionResponse, calendarResponse, friendsResponse] =
          await Promise.all([
            getUserStudySessions(currentUserId, {
              ...filterParams,
              page,
              size: pageSize,
            }),
            getUserStudySessions(currentUserId, {
              ...filterParams,
              ...weekRange,
              page: 0,
              size: CALENDAR_SESSION_PAGE_SIZE,
            }),
            getFriendsListService(currentUserId),
          ]);

        const content = sessionResponse.data?.content ?? [];
        const calendarContent = calendarResponse.data?.content ?? [];
        const friends = friendsResponse.data ?? [];
        const friendsById = new Map<number, FriendListItem>(
          friends.map((friend: any) => [friend.user_id, friend]),
        );

        if (!mounted) return;

        setSessions(
          content.map((session: any) => mapSessionToVm(session, friendsById)),
        );
        setCalendarSessions(
          calendarContent.map((session: any) =>
            mapSessionToVm(session, friendsById),
          ),
        );
        setSessionPage(sessionResponse.data ?? createEmptyPage(pageSize, page));
      } catch {
        if (!mounted) return;
        setSessions([]);
        setCalendarSessions([]);
        setSessionPage(createEmptyPage(pageSize, page));
        setSessionError("Không thể tải lịch học của bạn");
      } finally {
        if (mounted) {
          setLoadingSessions(false);
        }
      }
    }

    loadSessions();

    return () => {
      mounted = false;
    };
  }, [currentUserId, filter, page, pageSize, reloadTrigger]);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();

    return calendarSessions
      .filter((session) => new Date(session.startTime).toDateString() === today)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [calendarSessions]);

  const weekSessions = useMemo(() => {
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    return calendarSessions
      .filter((session) => {
        const startTime = new Date(session.startTime).getTime();
        return (
          startTime >= startOfWeek.getTime() &&
          startTime < endOfWeek.getTime()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [calendarSessions]);

  const handleCreateSession = (newSession: StudySessionVm) => {
    if (matchesFilter(newSession, filter)) {
      setPage(0);
      setSessions((prev) => [newSession, ...prev].slice(0, pageSize));
      setSessionPage((prev) => ({
        ...prev,
        empty: false,
        first: true,
        number: 0,
        numberOfElements: Math.min(prev.numberOfElements + 1, pageSize),
        totalElements: prev.totalElements + 1,
        totalPages: Math.max(1, Math.ceil((prev.totalElements + 1) / pageSize)),
      }));
    }

    if (matchesFilter(newSession, filter) && isSessionInCurrentWeek(newSession)) {
      setCalendarSessions((prev) => [newSession, ...prev]);
    }

    setIsCreateOpen(false);
  };

  const handleJoinSession = (joinData: JoinStudySessionResponse) => {
    setFeedbackEligibility(null);
    setJoinedSession(selectedSession);
    setJoinedRoom(joinData);
    setSelectedSession(null);
  };

  const handleLeaveRoom = useCallback(async (sessionId: number) => {
    setJoinedRoom(null);
    setFeedbackEligibility(null);
    const fallback =
      joinedSession ??
      sessions.find((session) => session.id === sessionId) ??
      null;

    if (fallback) {
      setSelectedSession(fallback);
    }

    if (!Number.isFinite(currentUserId) || currentUserId <= 0 || !fallback) {
      setJoinedSession(null);
      return;
    }

    try {
      const response = await getStudySessionById(sessionId, currentUserId);
      if (response.data) {
        const updatedSession = mapSessionToVm(response.data, new Map());

        setSessions((prev) => applySessionUpdate(prev, updatedSession, filter));
        setCalendarSessions((prev) =>
          applySessionUpdate(prev, updatedSession, filter),
        );
        setSelectedSession(updatedSession);
      }
    } catch {
    }

    try {
      const eligibilityResponse = await getFeedbackEligibility(
        sessionId,
        currentUserId,
      );
      setFeedbackEligibility(eligibilityResponse.data ?? null);
    } catch {
    } finally {
      setJoinedSession(null);
    }
  }, [currentUserId, filter, joinedSession, sessions]);

  if (loadingSessions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50/30 px-4 py-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-500" />
          <span className="text-sm font-medium text-gray-600">
            Đang tải lịch học...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <HeaderCard onCreateClick={() => setIsCreateOpen(true)} />

        {sessionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {sessionError}
          </div>
        )}

        <QuickStats sessions={weekSessions} />

        <FilterTabs activeFilter={filter} onChange={handleFilterChange} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_0.95fr]">
          <WeeklyCalendar
            sessions={weekSessions}
            onSelectSession={setSelectedSession}
          />
          <TodaySessionList
            sessions={todaySessions}
            onSelectSession={setSelectedSession}
          />
        </div>

        <AllSessionList
          sessions={sessions}
          page={sessionPage.number}
          pageSize={pageSize}
          pageSizeOptions={SESSION_PAGE_SIZE_OPTIONS}
          totalElements={sessionPage.totalElements}
          totalPages={sessionPage.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(0);
          }}
          onSelectSession={setSelectedSession}
        />
      </div>

      <CreateSessionModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSession}
      />

      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onSessionUpdated={(updatedSession) => {
          setSessions((prev) =>
            applySessionUpdate(prev, updatedSession, filter),
          );
          setCalendarSessions((prev) =>
            applySessionUpdate(prev, updatedSession, filter),
          );
          setSelectedSession(updatedSession);
        }}
        onJoinSession={handleJoinSession}
      />

      {feedbackEligibility?.sessionEnded && (
        <FeedbackSubmitPanel
          eligibility={feedbackEligibility}
          onClose={() => setFeedbackEligibility(null)}
        />
      )}

      {joinedRoom && (
        <StudySessionRoom
          joinData={joinedRoom}
          userName={currentUserName}
          userId={currentUserId}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}
