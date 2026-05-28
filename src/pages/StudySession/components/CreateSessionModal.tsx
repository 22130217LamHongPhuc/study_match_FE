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

  const needSystemRoom = studyMode === "ONLINE" || studyMode === "HYBRID";

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
  };

  const handleSubmit = async () => {
    console.log("Submitting form with values");

    if (sessionType === "GROUP" && !selectedGroup) {
      setGroupError("Vui lòng chọn nhóm học");
      return;
    }

    if (sessionType === "USER_PAIR" && !selectedFriend) {
      setFriendError("Vui lòng chọn bạn học");
      return;
    }

    try {
      if (sessionType === "USER_PAIR") {
        const friend = selectedFriend;

        const payload = {
          title,
          description,
          startTime,
          endTime,
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
        startTime,
        endTime,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tạo lịch học</h2>
            <p className="text-sm text-slate-500">
              Tạo lịch 1-1 hoặc lịch học nhóm
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

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="USER_PAIR">Học 1-1</option>
                <option value="GROUP">Học nhóm</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Hình thức học
              </span>

              <select
                value={studyMode}
                onChange={(event) =>
                  setStudyMode(event.target.value as StudyMode)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Trực tiếp</option>
                <option value="HYBRID">Kết hợp</option>
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Tiêu đề buổi học
            </span>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Ví dụ: Ôn Java OOP"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sessionType === "GROUP" ? (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Nhóm học
                </span>

                <select
                  value={selectedGroupId}
                  onChange={(event) => {
                    const value = event.target.value
                      ? Number(event.target.value)
                      : "";
                    const group = groups.find((item) => item.id === value);

                    setSelectedGroupId(value);
                    setTargetName(group?.name ?? "");
                    setSubjectName(
                      (current) => current || group?.subjectName || "",
                    );
                  }}
                  required
                  disabled={loadingGroups}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {loadingGroups && <option value="">Đang tải nhóm...</option>}
                  {!loadingGroups && groups.length === 0 && (
                    <option value="">Bạn chưa có nhóm nào</option>
                  )}
                  {!loadingGroups &&
                    groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </select>

                {groupError && (
                  <p className="text-xs font-medium text-red-500">
                    {groupError}
                  </p>
                )}
              </label>
            ) : (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Bạn học
                </span>

                <select
                  value={selectedFriendId}
                  onChange={(event) => {
                    const value = event.target.value
                      ? Number(event.target.value)
                      : "";
                    const friend = friends.find(
                      (item) => item.user_id === value,
                    );

                    setSelectedFriendId(value);
                    setTargetName(friend?.full_name ?? "");
                  }}
                  required
                  disabled={loadingFriends}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {loadingFriends && (
                    <option value="">Đang tải bạn bè...</option>
                  )}
                  {!loadingFriends && friends.length === 0 && (
                    <option value="">Bạn chưa có bạn bè nào</option>
                  )}
                  {!loadingFriends &&
                    friends.map((friend) => (
                      <option key={friend.user_id} value={friend.user_id}>
                        {friend.full_name}
                      </option>
                    ))}
                </select>

                {friendError && (
                  <p className="text-xs font-medium text-red-500">
                    {friendError}
                  </p>
                )}
              </label>
            )}
          </div>

          {sessionType === "GROUP" && selectedGroup && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm font-bold text-blue-700">
                {selectedGroup.name}
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-blue-700 sm:grid-cols-2">
                <p>Môn học: {selectedGroup.subjectName || "Chưa cập nhật"}</p>
                <p>Số thành viên tối đa: {selectedGroup.maxMembers}</p>
                <p>Hình thức nhóm: {selectedGroup.studyMode}</p>
                <p>Trạng thái: {selectedGroup.status}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Bắt đầu
              </span>

              <input
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Kết thúc
              </span>

              <input
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </div>

          {(studyMode === "OFFLINE" || studyMode === "HYBRID") && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Địa điểm học trực tiếp
              </span>

              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required={studyMode === "OFFLINE" || studyMode === "HYBRID"}
                placeholder="Ví dụ: Thư viện tầng 2, phòng B203"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
          )}

          {sessionType === "USER_PAIR" && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Link học online
              </span>

              <input
                value={meetingUrl}
                onChange={(event) => setMeetingUrl(event.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
          )}

          {needSystemRoom && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-bold text-emerald-700">
                Phòng học online sẽ được tạo tự động
              </p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Sau khi lịch học được tạo, hệ thống sẽ tạo phòng học online.
              </p>
            </div>
          )}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Mô tả</span>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Ghi chú nội dung cần học"
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>

            <button
              type="button"
              // disabled={
              //   sessionType === "GROUP" && (loadingGroups || !selectedGroup)
              // }
              onClick={handleSubmit}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Tạo lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
