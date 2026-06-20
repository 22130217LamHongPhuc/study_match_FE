import { useEffect, useMemo, useState } from "react";
import type { SessionType, StudyMode, StudySessionVm } from "../types";
import {
  createGroupStudySession,
  createPairStudySession,
} from "../../../services/StudySessionService";
import { getGroupsByUserId } from "../../../services/GroupService";
import type { StudyGroupDetailResponse } from "../../../services/GroupService";
import {
  getFriendsListService,
  type FriendListItem,
} from "../../../services/FriendService";
import { toast } from "sonner";
import { ChevronRight, Users, BookOpen } from "lucide-react";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (session: StudySessionVm) => void;
}

export function CreateSessionModal({
  open,
  onClose,
  onCreate,
}: CreateSessionModalProps) {
  const [sessionType, setSessionType] = useState<SessionType>("USER_PAIR");
  const [studyMode, setStudyMode] = useState<StudyMode>("ONLINE");

  const [title, setTitle] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [targetName, setTargetName] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [description, setDescription] = useState("");

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

  const formatLocalDateTime = (value: string) => {
    if (!value) return value;

    if (value.length === 16) {
      return `${value}:00`;
    }

    if (value.length === 19) {
      return value;
    }

    return value;
  };

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

        setGroups(data);

        if (data.length > 0) {
          setSelectedGroupId(data[0].id);
          setTargetName(data[0].name);
          setSubjectName((current) => current || data[0].subjectName || "");
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

  const resetForm = () => {
    setTitle("");
    setSubjectName("");
    setSubjectId(null);
    setStartTime("");
    setEndTime("");
    setTargetName("");
    setSelectedFriendId("");
    setLocation("");
    setMeetingUrl("");
    setDescription("");
    setSessionType("USER_PAIR");
    setStudyMode("ONLINE");
    setGroups([]);
    setSelectedGroupId("");
    setGroupError("");
    setFriends([]);
    setFriendError("");
    setIsGroupDropdownOpen(false);
    setGroupSearchQuery("");
    setIsFriendDropdownOpen(false);
    setFriendSearchQuery("");
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
    if (startTime >= endTime) {
      toast.error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");
      return;
    }


    try {
      if (sessionType === "USER_PAIR") {
        const friend = selectedFriend;

        const payload = {
          title,
          description,
          startTime: formatLocalDateTime(startTime),
          endTime: formatLocalDateTime(endTime),
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
        };

        const response = await createPairStudySession(payload);
        const createdSession = response.data;

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

        onCreate(newSession);
        resetForm();
        onClose();
        toast.success("Tạo lịch học 1-1 thành công");
        return;
      }

      const payload = {
        title,
        description,
        startTime: formatLocalDateTime(startTime),
        endTime: formatLocalDateTime(endTime),
        studyMode,
        location:
          studyMode === "OFFLINE" || studyMode === "HYBRID" ? location : "",
        createdByUserId: currentUserId,
        sessionType: "GROUP" as const,
        subjectName: subjectName || selectedGroup?.subjectName || "",
        subjectId,
      };

      const response = await createGroupStudySession(
        selectedGroup!.id,
        payload,
      );

      const createdSession = response.data;

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

      onCreate(newSession);
      resetForm();
      onClose();
      toast.success("Tạo lịch học nhóm thành công");
    } catch (error) {
      console.error(error);
      setGroupError("Tạo lịch học nhóm thất bại");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
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
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
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
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {selectedGroup ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-100 text-orange-600 font-bold text-xs shrink-0">
                        {selectedGroup.name.substring(0, 2).toUpperCase()}
                      </div>
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
                        className="mb-2 w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
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
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-orange-50/50 ${selectedGroupId === group.id ? "bg-orange-50 font-semibold" : ""
                              }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-orange-100 text-orange-600 font-bold">
                              {group.name.substring(0, 2).toUpperCase()}
                            </div>
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
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-all disabled:bg-gray-50 disabled:text-gray-400"
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-xs shrink-0">
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
                        className="mb-2 w-full rounded border border-gray-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
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
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-orange-50/50 ${selectedFriendId === friend.user_id ? "bg-orange-50 font-semibold" : ""
                              }`}
                          >
                            {friend.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold">
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


          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Bắt đầu
              </span>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-gray-700">
                Kết thúc
              </span>

              <input
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                className={inputClass}
              />
            </label>
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

          {needSystemRoom && (
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-sm font-bold text-green-700">
                Phòng học online sẽ được tạo tự động
              </p>
              <p className="mt-1 text-xs leading-5 text-green-700">
                Sau khi lịch học được tạo, hệ thống sẽ tạo phòng học online.
              </p>
            </div>
          )}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Mô tả</span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Ghi chú nội dung cần học"
              className={`${inputClass} resize-none`}
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
            >
              Tạo lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
