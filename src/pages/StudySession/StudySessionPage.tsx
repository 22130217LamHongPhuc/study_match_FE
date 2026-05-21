import { useMemo, useState } from "react";
import { HeaderCard } from "./components/HeaderCard";
import { QuickStats } from "./components/QuickStats";
import { FilterTabs } from "./components/FilterTabs";
import { WeeklyCalendar } from "./components/WeeklyCalendar";
import { TodaySessionList } from "./components/TodaySessionList";
import { AllSessionList } from "./components/AllSessionList";
import { CreateSessionModal } from "./components/CreateSessionModal";
import { SessionDetailModal } from "./components/SessionDetailModal";
import type { ScheduleFilter, StudySessionVm } from "./types";

const mockSessions: StudySessionVm[] = [
  {
    id: 1,
    sessionType: "USER_PAIR",
    groupId: null,
    title: "Ôn Java OOP",
    description:
      "Ôn lại kế thừa, interface, abstract class và bài tập thực hành.",
    subjectName: "Lập trình Java",
    startTime: "2026-05-21T19:00:00",
    endTime: "2026-05-21T20:30:00",
    studyMode: "ONLINE",
    meetingUrl: "https://meet.google.com/demo-java-oop",
    createdByUserId: 1,
    status: "SCHEDULED",
    participantStatus: "ACCEPTED",
    partnerName: "Minh Anh",
  },
  {
    id: 10,
    sessionType: "USER_PAIR",
    groupId: null,
    title: "Ôn Java OOP",
    description:
      "Ôn lại kế thừa, interface, abstract class và bài tập thực hành.",
    subjectName: "Lập trình Java",
    startTime: "2026-05-21T15:00:00",
    endTime: "2026-05-21T27:30:00",
    studyMode: "ONLINE",
    meetingUrl: "https://meet.google.com/demo-java-oop",
    createdByUserId: 1,
    status: "SCHEDULED",
    participantStatus: "ACCEPTED",
    partnerName: "Minh Anh",
  },
  {
    id: 2,
    sessionType: "GROUP",
    groupId: 12,
    title: "Luyện SQL JOIN",
    description: "Làm bài tập join, group by và subquery.",
    subjectName: "Cơ sở dữ liệu",
    startTime: "2026-05-22T08:00:00",
    endTime: "2026-05-22T09:30:00",
    studyMode: "OFFLINE",
    location: "Thư viện tầng 2",
    createdByUserId: 3,
    status: "SCHEDULED",
    participantStatus: "ACCEPTED",
    groupName: "Nhóm CSDL K18",
    membersCount: 5,
  },
  {
    id: 3,
    sessionType: "USER_PAIR",
    groupId: null,
    title: "Review React Router",
    description: "Ôn route, layout, protected route và nested route.",
    subjectName: "Frontend",
    startTime: "2026-05-23T14:00:00",
    endTime: "2026-05-23T15:00:00",
    studyMode: "ONLINE",
    meetingUrl: "https://meet.google.com/demo-react",
    createdByUserId: 2,
    status: "SCHEDULED",
    participantStatus: "PENDING",
    partnerName: "Tuấn Kiệt",
  },
  {
    id: 4,
    sessionType: "GROUP",
    groupId: 15,
    title: "Chuẩn bị thuyết trình nhóm",
    description: "Phân chia nội dung và luyện nói trước buổi báo cáo.",
    subjectName: "Kỹ năng mềm",
    startTime: "2026-05-24T18:30:00",
    endTime: "2026-05-24T20:00:00",
    studyMode: "HYBRID",
    location: "Phòng tự học B203",
    meetingUrl: "https://meet.google.com/demo-group",
    createdByUserId: 5,
    status: "SCHEDULED",
    participantStatus: "PENDING",
    groupName: "Team Presentation",
    membersCount: 4,
  },
];

export default function StudySessionPage() {
  const [sessions, setSessions] = useState<StudySessionVm[]>(mockSessions);
  const [filter, setFilter] = useState<ScheduleFilter>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySessionVm | null>(
    null,
  );

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
    return filteredSessions.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }, [filteredSessions]);

  const handleCreateSession = (newSession: StudySessionVm) => {
    setSessions((prev) => [newSession, ...prev]);
    setIsCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <HeaderCard onCreateClick={() => setIsCreateOpen(true)} />

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
      />
    </div>
  );
}
