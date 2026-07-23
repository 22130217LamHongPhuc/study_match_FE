import { useEffect, useMemo, useState } from "react";
import type { SessionType, StudyMode, StudySessionVm } from "../types";
import {
  createGroupStudySession,
  createPairStudySession,
} from "../../../services/StudySessionService";
import { isApiSuccess } from "../../../config/apiClient";
import { getGroupAvatarUrl, getGroupsByUserId } from "../../../services/GroupService";
import type { StudyGroupDetailResponse } from "../../../services/GroupService";
import {
  getFriendsListService,
  type FriendListItem,
} from "../../../services/FriendService";
import { toast } from "react-toastify";
import { ChevronRight, Users, BookOpen, Sunrise, Sun, MoonStar } from "lucide-react";

export interface SlotConfig {
  id: string;
  label: string;
  time: string;
  icon: React.ComponentType<any>;
}

export const SLOTS: SlotConfig[] = [
  { id: "ca1", label: "Ca 1", time: "7h00–9h15", icon: Sunrise },
  { id: "ca2", label: "Ca 2", time: "9h30–11h45", icon: Sunrise },
  { id: "ca3", label: "Ca 3", time: "12h15–14h30", icon: Sun },
  { id: "ca4", label: "Ca 4", time: "14h50–17h05", icon: Sun },
  { id: "ca5", label: "Ca 5", time: "17h30–19h45", icon: MoonStar },
  { id: "ca6", label: "Ca 6", time: "20h00–21h45", icon: MoonStar },
];

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (session: StudySessionVm) => void;
}

function GroupMiniAvatar({ group }: { group: StudyGroupDetailResponse }) {
  const avatarUrl = getGroupAvatarUrl(group);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={group.name}
        className="h-8 w-8 shrink-0 rounded-full object-cover border border-gray-100"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4285f4] text-white">
      <Users size={17} strokeWidth={2.4} />
    </div>
  );
}

export function CreateSessionModal({
  open,
  onClose,
  onCreate,
}: CreateSessionModalProps) {
  const [sessionType, setSessionType] = useState<SessionType>("USER_PAIR");
  const [studyMode, setStudyMode] = useState<StudyMode>("ONLINE");
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"NONE" | "WEEKLY">("NONE");
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [endDate, setEndDate] = useState("");
  const [targetName, setTargetName] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [description, setDescription] = useState("");
  const [useShift, setUseShift] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [groups, setGroups] = useState<StudyGroupDetailResponse[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendError, setFriendError] = useState("");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  const currentUserId = Number(localStorage.getItem("userId") ?? "1");

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return groups.find((group) => group.id === Number(selectedGroupId)) ?? null;
  }, [groups, selectedGroupId]);

  const selectedFriend = useMemo(() => {
    if (!selectedFriendId) return null;
    return (
      friends.find((friend) => friend.user_id === Number(selectedFriendId)) ??
      null
    );
  }, [friends, selectedFriendId]);

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
        (g.subjectName &&
          g.subjectName.toLowerCase().includes(groupSearchQuery.toLowerCase())),
    );
  }, [groups, groupSearchQuery]);

  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friends;
    return friends.filter((f) =>
      f.full_name.toLowerCase().includes(friendSearchQuery.toLowerCase()),
    );
  }, [friends, friendSearchQuery]);

  const needSystemRoom = studyMode === "ONLINE" || studyMode === "HYBRID";

  const getLastDayOfMonth = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toLocaleDateString("en-CA");
  };

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getWeeklyDates = (startStr: string, endStr: string, days: string[]) => {
    if (!startStr || !endStr || days.length === 0) return [];
    const dates: Date[] = [];
    const start = parseLocalDate(startStr);
    const end = parseLocalDate(endStr);
    if (end < start) return [];

    const dayMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    const targetDays = days.map((day) => dayMap[day]);

    let current = new Date(start);
    while (current <= end) {
      if (targetDays.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const DAYS = [
    { label: "T2", value: "MONDAY" },
    { label: "T3", value: "TUESDAY" },
    { label: "T4", value: "WEDNESDAY" },
    { label: "T5", value: "THURSDAY" },
    { label: "T6", value: "FRIDAY" },
    { label: "T7", value: "SATURDAY" },
    { label: "CN", value: "SUNDAY" },
  ];

  const toggleDay = (dayValue: string) => {
    setRepeatDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const formatTimeWithSeconds = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.split(":").length === 2) {
      return `${timeStr}:00`;
    }
    return timeStr;
  };

  useEffect(() => {
    if (!startDate) return;
    const lastDay = getLastDayOfMonth(startDate);
    if (endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      const isValid =
        endD.getFullYear() === startD.getFullYear() &&
        endD.getMonth() === startD.getMonth() &&
        endDate >= startDate;
      if (!isValid) {
        setEndDate(lastDay);
      }
    } else {
      setEndDate(lastDay);
    }
  }, [startDate]);

  const weeklyDates = useMemo(() => {
    if (!isRecurring || recurrenceType !== "WEEKLY") return [];
    return getWeeklyDates(startDate, endDate, repeatDays);
  }, [isRecurring, recurrenceType, startDate, endDate, repeatDays]);

  const expectedSessionsCount = isRecurring ? weeklyDates.length : 1;

  const formattedDatesList = useMemo(() => {
    return weeklyDates
      .map((d) =>
        d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      )
      .join(", ");
  }, [weeklyDates]);

  useEffect(() => {
    if (!open) return;

    if (sessionType !== "GROUP") {
      setGroups([]);
      setSelectedGroupId("");
      setGroupError("");
      setSelectedFriendId("");
      setFriends([]);
      setFriendError("");
      return;
    }

    let mounted = true;

    async function loadGroups() {
      try {
        setLoadingGroups(true);
        setGroupError("");

        const response = await getGroupsByUserId(currentUserId);
        const data = response.data ?? [];

        if (!mounted) return;

        const filteredGroups = data.filter(
          (g) => g.visibility !== "COMMUNITY" && g.visibility !== "COMUNITY"
        );
        setGroups(filteredGroups);

        if (filteredGroups.length > 0) {
          setSelectedGroupId(filteredGroups[0].id);
          setTargetName(filteredGroups[0].name);
          setSubjectName((current) => current || filteredGroups[0].subjectName || "");
        } else {
          setSelectedGroupId("");
          setTargetName("");
        }
      } catch {
        if (!mounted) return;
        setGroups([]);
        setSelectedGroupId("");
        setGroupError("Không thể tải danh sách nhóm của bạn");
      } finally {
        if (mounted) {
          setLoadingGroups(false);
        }
      }
    }

    loadGroups();

    return () => {
      mounted = false;
    };
  }, [open, sessionType, currentUserId]);

  useEffect(() => {
    if (!open || sessionType !== "USER_PAIR") {
      setFriends([]);
      setSelectedFriendId("");
      setFriendError("");
      setLoadingFriends(false);
      return;
    }

    let mounted = true;

    async function loadFriends() {
      try {
        setLoadingFriends(true);
        setFriendError("");

        const response = await getFriendsListService(currentUserId);
        const data = response.data ?? [];

        if (!mounted) return;

        setFriends(data);

        if (data.length > 0) {
          setSelectedFriendId(data[0].user_id);
          setTargetName(data[0].full_name);
        }
      } catch {
        if (!mounted) return;
        setFriends([]);
        setSelectedFriendId("");
        setFriendError("Không thể tải danh sách bạn bè");
      } finally {
        if (mounted) {
          setLoadingFriends(false);
        }
      }
    }

    loadFriends();

    return () => {
      mounted = false;
    };
  }, [open, sessionType, currentUserId]);

  useEffect(() => {
    if (sessionType !== "GROUP") return;
    if (!selectedGroup) return;

    setTargetName(selectedGroup.name);
    setSubjectName((current) => current || selectedGroup.subjectName || "");
  }, [sessionType, selectedGroup]);

  if (!open) return null;

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    switch (slotId) {
      case "ca1":
        setStartTime("07:00");
        setEndTime("09:15");
        break;
      case "ca2":
        setStartTime("09:30");
        setEndTime("11:45");
        break;
      case "ca3":
        setStartTime("12:15");
        setEndTime("14:30");
        break;
      case "ca4":
        setStartTime("14:50");
        setEndTime("17:05");
        break;
      case "ca5":
        setStartTime("17:30");
        setEndTime("19:45");
        break;
      case "ca6":
        setStartTime("20:00");
        setEndTime("21:45");
        break;
      default:
        break;
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubjectName("");
    setSubjectId(null);
    setStartDate(new Date().toLocaleDateString("en-CA"));
    setStartTime("");
    setEndTime("");
    setIsRecurring(false);
    setRecurrenceType("NONE");
    setRepeatDays([]);
    setEndDate("");
    setTargetName("");
    setSelectedFriendId("");
    setLocation("");
    setMeetingUrl("");
    setDescription("");
    setSessionType("USER_PAIR");
    setStudyMode("ONLINE");
    setUseShift(false);
    setSelectedSlot(null);
    setGroups([]);
    setSelectedGroupId("");
    setGroupError("");
    setFriends([]);
    setFriendError("");
    setIsGroupDropdownOpen(false);
    setGroupSearchQuery("");
    setIsFriendDropdownOpen(false);
    setFriendSearchQuery("");
    setIsCreating(false);
  };

  const handleSubmit = async () => {
    if (sessionType === "GROUP" && !selectedGroup) {
      setGroupError("Vui lòng chọn nhóm học");
      return;
    }

    if (sessionType === "USER_PAIR" && !selectedFriend) {
      setFriendError("Vui lòng chọn bạn học");
      return;
    }

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề buổi học");
      return;
    }

    if (!startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return;
    }

    if (!startTime) {
      toast.error("Vui lòng chọn giờ bắt đầu");
      return;
    }

    if (!endTime) {
      toast.error("Vui lòng chọn giờ kết thúc");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const now = new Date();
    if (startDateTime <= now) {
      toast.error("Thời gian bắt đầu không được ở trong quá khứ");
      return;
    }

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu");
      return;
    }
    if (diff < 5) {
      toast.error("Buổi học phải kéo dài ít nhất 5 phút");
      return;
    }
    if (diff > 8 * 60) {
      toast.error("Buổi học không được kéo dài quá 8 tiếng");
      return;
    }

    if (isRecurring && repeatDays.length === 0) {
      toast.error("Lịch lặp phải chọn ít nhất một ngày trong tuần");
      return;
    }

    if (isRecurring) {
      const lastDay = getLastDayOfMonth(startDate);
      if (endDate < startDate || endDate > lastDay) {
        toast.error(`Ngày kết thúc phải từ ${startDate} đến ${lastDay}`);
        return;
      }
    }

    if (isRecurring && weeklyDates.length === 0) {
      toast.error("Không tìm thấy ngày phù hợp nào trong khoảng thời gian đã chọn");
      return;
    }

    if (isRecurring && weeklyDates.length > 31) {
      toast.error("Số lượng buổi học vượt quá giới hạn cho phép (tối đa 31 buổi)");
      return;
    }

    try {
      setIsCreating(true);
      if (sessionType === "USER_PAIR") {
        const friend = selectedFriend;

        const payload = {
          title,
          description,
          startDate,
          endDate: isRecurring ? endDate : null,
          startTime: formatTimeWithSeconds(startTime),
          endTime: formatTimeWithSeconds(endTime),
          studyMode,
          location:
            studyMode === "OFFLINE" || studyMode === "HYBRID" ? location : "",
          meetingUrl: meetingUrl || "",
          createdByUserId: currentUserId,
          sessionType: "USER_PAIR" as const,
          subjectName: null,
          subjectId: null,
          partnerUserId: friend!.user_id,
          partnerUserName: friend!.full_name,
          recurrenceType: isRecurring ? "WEEKLY" : "NONE",
          repeatDays: isRecurring ? repeatDays : [],
        };

        const response = await createPairStudySession(payload);
        if (!response || !isApiSuccess(response)) {
          toast.error(response?.message || "Tạo lịch học 1-1 thất bại");
          return;
        }
        const createdSession = response.data;
        const totalCreated = createdSession.totalCreated ?? expectedSessionsCount;

        const newSession: StudySessionVm = {
          id: createdSession.id,
          sessionType: "USER_PAIR",
          groupId: null,
          title: createdSession.title,
          description: createdSession.description ?? "",
          subjectName: createdSession.subjectName ?? undefined,
          startTime: createdSession.startTime,
          endTime: createdSession.endTime,
          studyMode: createdSession.studyMode,
          location: createdSession.location ?? undefined,
          meetingUrl: createdSession.meetingUrl ?? undefined,
          createdByUserId: createdSession.createdByUserId,
          status: "SCHEDULED",
          participantStatus: createdSession.participantStatus,
          partnerName:
            createdSession.partnerUserName ??
            createdSession.partnerName ??
            friend!.full_name,
        };

        toast.success(`Đã tạo thành công ${totalCreated} buổi học`);
        onCreate(newSession);
        window.dispatchEvent(new Event("study_session_updated"));
        resetForm();
        onClose();
        return;
      }

      const payload = {
        title,
        description,
        startDate,
        endDate: isRecurring ? endDate : null,
        startTime: formatTimeWithSeconds(startTime),
        endTime: formatTimeWithSeconds(endTime),
        studyMode,
        location:
          studyMode === "OFFLINE" || studyMode === "HYBRID" ? location : "",
        createdByUserId: currentUserId,
        sessionType: "GROUP" as const,
        subjectName: subjectName || selectedGroup?.subjectName || "",
        subjectId,
        recurrenceType: isRecurring ? "WEEKLY" : "NONE",
        repeatDays: isRecurring ? repeatDays : [],
      };

      const response = await createGroupStudySession(
        selectedGroup!.id,
        payload,
      );
      if (!response || !isApiSuccess(response)) {
        toast.error(response?.message || "Tạo lịch học nhóm thất bại");
        return;
      }
      const createdSession = response.data;
      const totalCreated = createdSession.totalCreated ?? expectedSessionsCount;

      const newSession: StudySessionVm = {
        id: createdSession.id,
        sessionType: "GROUP",
        groupId: selectedGroup!.id,
        title: createdSession.title,
        description: createdSession.description ?? "",
        subjectName: createdSession.subjectName ?? undefined,
        startTime: createdSession.startTime,
        endTime: createdSession.endTime,
        studyMode: createdSession.studyMode,
        location: createdSession.location ?? undefined,
        meetingUrl: createdSession.meetingUrl ?? undefined,
        createdByUserId: createdSession.createdByUserId,
        status: "SCHEDULED",
        participantStatus: createdSession.participantStatus,
        groupName: selectedGroup!.name,
        membersCount: selectedGroup!.maxMembers,
      };

      toast.success(`Đã tạo thành công ${totalCreated} buổi học`);
      onCreate(newSession);
      window.dispatchEvent(new Event("study_session_updated"));
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || "Tạo lịch học thất bại";
      toast.error(errMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="max-h-[calc(100vh-160px)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Tạo lịch học</h2>
            <p className="text-sm text-gray-500">
              Tạo lịch 1-1 hoặc lịch học nhóm
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Loại lịch
              </span>

              <select
                value={sessionType}
                onChange={(event) => {
                  const value = event.target.value as SessionType;
                  setSessionType(value);
                  setTargetName("");
                  setSelectedGroupId("");
                  setSelectedFriendId("");
                }}
                className={inputClass}
              >
                <option value="USER_PAIR">Học 1-1</option>
                <option value="GROUP">Học nhóm</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Hình thức học
              </span>

              <select
                value={studyMode}
                onChange={(event) =>
                  setStudyMode(event.target.value as StudyMode)
                }
                className={inputClass}
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Trực tiếp</option>
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">
              Tiêu đề buổi học
            </span>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Ví dụ: Ôn Java OOP"
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sessionType === "GROUP" ? (
              <div className="relative space-y-2">
                <span className="text-sm font-semibold text-gray-700">
                  Nhóm học
                </span>

                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  disabled={loadingGroups}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {selectedGroup ? (
                    <div className="flex items-center gap-3">
                      <GroupMiniAvatar group={selectedGroup} />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{selectedGroup.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {selectedGroup.subjectName || "Không môn học"} • Tối đa {selectedGroup.maxMembers} thành viên
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Chọn nhóm học...</span>
                  )}
                  <ChevronRight size={16} className={`text-gray-400 transition-transform shrink-0 ${isGroupDropdownOpen ? "rotate-90" : ""}`} />
                </button>

                {isGroupDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsGroupDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      <input
                        type="text"
                        placeholder="Tìm kiếm nhóm..."
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        className="mb-2 w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                      />
                      {loadingGroups && (
                        <div className="py-2 text-center text-xs text-gray-400">Đang tải nhóm...</div>
                      )}
                      {!loadingGroups && groups.length === 0 && (
                        <div className="py-2 text-center text-xs text-gray-400">Bạn chưa có nhóm nào</div>
                      )}
                      {!loadingGroups && filteredGroups.length === 0 && groups.length > 0 && (
                        <div className="py-2 text-center text-xs text-gray-400">Không tìm thấy nhóm</div>
                      )}
                      {!loadingGroups &&
                        filteredGroups.map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => {
                              setSelectedGroupId(group.id);
                              setTargetName(group.name);
                              setSubjectName(
                                (current) => current || group.subjectName || "",
                              );
                              setIsGroupDropdownOpen(false);
                              setGroupSearchQuery("");
                            }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50/50 ${selectedGroupId === group.id ? "bg-blue-50 font-semibold" : ""
                              }`}
                          >
                            <GroupMiniAvatar group={group} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-gray-800 font-semibold">{group.name}</div>
                              <div className="truncate text-gray-400 mt-0.5">
                                {group.subjectName || "Không môn học"} • Tối đa {group.maxMembers} thành viên
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {groupError && (
                  <p className="text-xs font-medium text-red-500">
                    {groupError}
                  </p>
                )}
              </div>
            ) : (
              <div className="relative space-y-2">
                <span className="text-sm font-semibold text-gray-700">
                  Bạn học
                </span>

                <button
                  type="button"
                  onClick={() => setIsFriendDropdownOpen(!isFriendDropdownOpen)}
                  disabled={loadingFriends}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {selectedFriend ? (
                    <div className="flex items-center gap-3">
                      {selectedFriend.avatar_url ? (
                        <img
                          src={selectedFriend.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0">
                          {selectedFriend.full_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{selectedFriend.full_name}</div>

                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Chọn bạn học...</span>
                  )}
                  <ChevronRight size={16} className={`text-gray-400 transition-transform shrink-0 ${isFriendDropdownOpen ? "rotate-90" : ""}`} />
                </button>

                {isFriendDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFriendDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      <input
                        type="text"
                        placeholder="Tìm kiếm bạn học..."
                        value={friendSearchQuery}
                        onChange={(e) => setFriendSearchQuery(e.target.value)}
                        className="mb-2 w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                      />
                      {loadingFriends && (
                        <div className="py-2 text-center text-xs text-gray-400">Đang tải bạn bè...</div>
                      )}
                      {!loadingFriends && friends.length === 0 && (
                        <div className="py-2 text-center text-xs text-gray-400">Bạn chưa có bạn bè nào</div>
                      )}
                      {!loadingFriends && filteredFriends.length === 0 && friends.length > 0 && (
                        <div className="py-2 text-center text-xs text-gray-400">Không tìm thấy bạn học</div>
                      )}
                      {!loadingFriends &&
                        filteredFriends.map((friend) => (
                          <button
                            key={friend.user_id}
                            type="button"
                            onClick={() => {
                              setSelectedFriendId(friend.user_id);
                              setTargetName(friend.full_name);
                              setIsFriendDropdownOpen(false);
                              setFriendSearchQuery("");
                            }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-blue-50/50 ${selectedFriendId === friend.user_id ? "bg-blue-50 font-semibold" : ""
                              }`}
                          >
                            {friend.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                                {friend.full_name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-gray-800 font-semibold">{friend.full_name}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </>
                )}

                {friendError && (
                  <p className="text-xs font-medium text-red-500">
                    {friendError}
                  </p>
                )}
              </div>
            )}
          </div>


          <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Phương thức chọn thời gian học
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseShift(false);
                    setSelectedSlot(null);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    !useShift
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Nhập giờ tùy chỉnh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseShift(true);
                    handleSlotSelect("ca1");
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    useShift
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Chọn theo ca học
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">
                  Ngày bắt đầu
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>

              {!useShift && (
                <>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Giờ bắt đầu
                    </span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Giờ kết thúc
                    </span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      required
                      className={inputClass}
                    />
                  </label>
                </>
              )}
            </div>

            {useShift && (
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-700 block">
                  Chọn ca học
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SLOTS.map((slot) => {
                    const SlotIcon = slot.icon;
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot.id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <SlotIcon size={18} className={`${isSelected ? "text-blue-500" : "text-gray-400"} mb-1.5`} />
                        <span className="text-xs font-bold">{slot.label}</span>
                        <span className="mt-0.5 text-[10px] opacity-80">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedSlot && (
                  <p className="text-xs font-medium text-blue-600 bg-blue-50/50 rounded-lg p-2.5 border border-blue-100">
                    Thời gian học đã chọn: <strong>{SLOTS.find(s => s.id === selectedSlot)?.time}</strong> ({SLOTS.find(s => s.id === selectedSlot)?.label})
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsRecurring(checked);
                  setRecurrenceType(checked ? "WEEKLY" : "NONE");
                  if (!checked) {
                    setRepeatDays([]);
                  }
                }}
                className="h-4.5 w-4.5 rounded border-gray-300 text-blue-600 focus:ring-blue-200"
              />
              <div>
                <span className="text-sm font-semibold text-gray-800">Lặp lại lịch học</span>
                <span className="block text-xs text-gray-400 mt-0.5">Tạo chuỗi lịch lặp lại hàng tuần tự động</span>
              </div>
            </label>

            {isRecurring && (
              <div className="space-y-4 border-t border-gray-100 pt-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                      Ngày kết thúc lặp
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={getLastDayOfMonth(startDate)}
                      onChange={(e) => setEndDate(e.target.value)}
                      required={isRecurring}
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Chọn các ngày lặp trong tuần
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const isSel = repeatDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={
                            isSel
                              ? "bg-blue-500 text-white border-blue-500 font-semibold text-sm h-10 w-10 rounded-full transition-all shrink-0 border"
                              : "bg-white text-gray-600 border-gray-200 font-semibold text-sm h-10 w-10 rounded-full transition-all shrink-0 border hover:bg-gray-50"
                          }
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                  <div>
                    <strong>Dự kiến tạo: </strong>
                    <span className={weeklyDates.length === 0 ? "text-red-500 font-semibold" : "font-semibold"}>
                      {weeklyDates.length} buổi học
                    </span>
                  </div>
                  {weeklyDates.length > 0 && (
                    <div className="text-[11px] text-gray-500">
                      Các ngày: {formattedDatesList}
                    </div>
                  )}
                  {isRecurring && repeatDays.length === 0 && (
                    <div className="text-red-500 font-medium">
                      Vui lòng chọn ít nhất một ngày lặp trong tuần
                    </div>
                  )}
                  {isRecurring && repeatDays.length > 0 && weeklyDates.length === 0 && (
                    <div className="text-red-500 font-medium">
                      Không tìm thấy ngày phù hợp nào trong khoảng từ {startDate} đến {endDate}
                    </div>
                  )}
                  {weeklyDates.length > 31 && (
                    <div className="text-red-500 font-medium">
                      Không được tạo quá 31 buổi học (hiện tại: {weeklyDates.length} buổi)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {(studyMode === "OFFLINE" || studyMode === "HYBRID") && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Địa điểm học trực tiếp
              </span>

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required={studyMode === "OFFLINE" || studyMode === "HYBRID"}
                placeholder="Ví dụ: Thư viện tầng 2, phòng B203"
                className={inputClass}
              />
            </label>
          )}

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-gray-700">Mô tả</span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Ghi chú nội dung cần học"
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isCreating ||
              (isRecurring && (repeatDays.length === 0 || weeklyDates.length === 0 || weeklyDates.length > 31))
            }
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-450 transition-colors flex items-center gap-2 justify-center min-w-[120px]"
          >
            {isCreating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Đang tạo...
              </>
            ) : isRecurring ? (
              `Tạo ${expectedSessionsCount} buổi học`
            ) : (
              "Tạo lịch học"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
