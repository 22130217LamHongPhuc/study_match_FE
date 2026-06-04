import { useEffect, useMemo, useState } from "react";
import { HeaderCard } from "./components/HeaderCard";
import { QuickStats } from "./components/QuickStats";
import { FilterTabs } from "./components/FilterTabs";
import { WeeklyCalendar } from "./components/WeeklyCalendar";
import { TodaySessionList } from "./components/TodaySessionList";
import { AllSessionList } from "./components/AllSessionList";
import { CreateSessionModal } from "./components/CreateSessionModal";
import { SessionDetailModal } from "./components/SessionDetailModal";
import { StudySessionRoom } from "./components/StudySessionRoom";
import type { ScheduleFilter, StudySessionVm } from "./types";
import { getUserStudySessions } from "../../services/StudySessionService";
import {
  getFriendsListService,
  type FriendListItem,
} from "../../services/FriendService";
import type { JoinStudySessionResponse, StudySessionResponse } from "./types";

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

export default function StudySessionPage() {
  const [sessions, setSessions] = useState<StudySessionVm[]>([]);
  const [filter, setFilter] = useState<ScheduleFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySessionVm | null>(
    null,
  );
  const [joinedRoom, setJoinedRoom] = useState<JoinStudySessionResponse | null>(
    null,
  );
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState("");

  const currentUserName =
    localStorage.getItem("fullName") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("username") ||
    "Người dùng";

  useEffect(() => {
    let mounted = true;

    async function loadSessions() {
      const userId = Number(localStorage.getItem("userId"));

      if (!Number.isFinite(userId) || userId <= 0) {
        if (mounted) {
          setSessions([]);
          setSessionError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
          setLoadingSessions(false);
        }
        return;
      }

      try {
        setLoadingSessions(true);
        setSessionError("");

        const [sessionResponse, friendsResponse] = await Promise.all([
          getUserStudySessions(userId),
          getFriendsListService(userId),
        ]);

        const content = sessionResponse.data?.content ?? [];
        const friends = friendsResponse.data ?? [];
        const friendsById = new Map<number, FriendListItem>(
          friends.map((friend: any) => [friend.user_id, friend]),
        );

        if (!mounted) return;

        setSessions(
          content.map((session: any) => mapSessionToVm(session, friendsById)),
        );
      } catch {
        if (!mounted) return;
        setSessions([]);
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
  }, []);

  const filteredSessions = useMemo(() => {
    if (filter === "ALL") {
      return sessions;
    }

    if (filter === "PENDING") {
      return sessions.filter(
        (session) => session.participantStatus === "PENDING",
      );
    }

    return sessions.filter((session) => session.sessionType === filter);
  }, [sessions, filter]);

  const todaySessions = useMemo(() => {
    const today = new Date().toDateString();

    return sessions
      .filter((session) => new Date(session.startTime).toDateString() === today)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [sessions]);

  const weekSessions = useMemo(() => {
    return [...filteredSessions].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }, [filteredSessions]);

  const handleCreateSession = (newSession: StudySessionVm) => {
    setSessions((prev) => [newSession, ...prev]);
    setIsCreateOpen(false);
  };

  const handleJoinSession = (joinData: JoinStudySessionResponse) => {
    setJoinedRoom(joinData);
    setSelectedSession(null);
  };

  const handleLeaveRoom = () => {
    setJoinedRoom(null);
  };

  if (loadingSessions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50/30 px-4 py-5">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-5">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
          <span className="text-sm font-medium text-gray-600">
            Đang tải lịch học...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <HeaderCard onCreateClick={() => setIsCreateOpen(true)} />

        {sessionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {sessionError}
          </div>
        )}

        <QuickStats sessions={sessions} />

        <FilterTabs activeFilter={filter} onChange={setFilter} />

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
          sessions={filteredSessions}
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
            prev.map((session) =>
              session.id === updatedSession.id ? updatedSession : session,
            ),
          );
          setSelectedSession(updatedSession);
        }}
        onJoinSession={handleJoinSession}
      />

      {joinedRoom && (
        <StudySessionRoom
          joinData={joinedRoom}
          userName={currentUserName}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}
