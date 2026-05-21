import { useEffect, useMemo, useState } from "react";
import type { SessionType, StudyMode, StudySessionVm } from "../types";
import { getGroupsByUserId } from "../../../services/GroupService";
import type { StudyGroupDetailResponse } from "../../../services/GroupService";

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
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [targetName, setTargetName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [groups, setGroups] = useState<StudyGroupDetailResponse[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState("");

  const currentUserId = Number(localStorage.getItem("userId") ?? "1");

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return groups.find((group) => group.id === Number(selectedGroupId)) ?? null;
  }, [groups, selectedGroupId]);

  const needSystemRoom = studyMode === "ONLINE" || studyMode === "HYBRID";

  useEffect(() => {
    if (!open) return;

    if (sessionType !== "GROUP") {
      setGroups([]);
      setSelectedGroupId("");
      setGroupError("");
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
    if (sessionType !== "GROUP") return;
    if (!selectedGroup) return;

    setTargetName(selectedGroup.name);
    setSubjectName((current) => current || selectedGroup.subjectName || "");
  }, [sessionType, selectedGroup]);

  if (!open) return null;

  const resetForm = () => {
    setTitle("");
    setSubjectName("");
    setStartTime("");
    setEndTime("");
    setTargetName("");
    setLocation("");
    setDescription("");
    setSessionType("USER_PAIR");
    setStudyMode("ONLINE");
    setGroups([]);
    setSelectedGroupId("");
    setGroupError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sessionType === "GROUP" && !selectedGroup) {
      setGroupError("Vui lòng chọn nhóm học");
      return;
    }

    const newSession: StudySessionVm = {
      id: Date.now(),
      sessionType,
      groupId: sessionType === "GROUP" ? (selectedGroup?.id ?? null) : null,
      title,
      description,
      subjectName: subjectName || selectedGroup?.subjectName || "",
      startTime,
      endTime,
      studyMode,
      location:
        studyMode === "OFFLINE" || studyMode === "HYBRID" ? location : "",
      meetingUrl: needSystemRoom ? "" : "",
      createdByUserId: currentUserId,
      status: "SCHEDULED",
      participantStatus: "PENDING",
      partnerName: sessionType === "USER_PAIR" ? targetName : undefined,
      groupName: sessionType === "GROUP" ? selectedGroup?.name : undefined,
      membersCount:
        sessionType === "GROUP" ? selectedGroup?.maxMembers : undefined,
    };

    onCreate(newSession);
    resetForm();
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

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
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

                <input
                  value={targetName}
                  onChange={(event) => setTargetName(event.target.value)}
                  placeholder="Phần chọn bạn học sẽ xử lý sau"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
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
              type="submit"
              disabled={
                sessionType === "GROUP" && (loadingGroups || !selectedGroup)
              }
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Tạo lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
