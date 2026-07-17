import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Camera,
  ChevronRight,
  ChevronLeft,
  Plus,
  Search,
  Globe,
  Lock
} from "lucide-react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

import { initFreeTime } from "../../Onboarding/components/constants";
import type { FreeTime, Subject } from "../../Onboarding/components/types";
import FreeTimePicker from "../../CreateGroup/components/FreeTimePicker";

import {
  createStudyGroup,
  getAllSubjectsByCurriculum,
  type CreateStudyGroupRequest,
  type DayOfWeek,
  type FreeTimeSlotRequest,
  type SlotCode
} from "../../../services/GroupService";
import {
  getFriendsListService,
  type FriendListItem
} from "../../../services/FriendService";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type StepId = 1 | 2 | 3 | 4 | 5;

interface StepItem {
  id: StepId;
  name: string;
  desc: string;
}

const STEPS: StepItem[] = [
  { id: 1, name: "Cơ bản", desc: "Tên & Mô tả nhóm" },
  { id: 2, name: "Môn học", desc: "Chọn môn học chính" },
  { id: 3, name: "Thiết lập", desc: "Số lượng & Quyền riêng tư" },
  { id: 4, name: "Lịch học", desc: "Thời gian rảnh dự kiến" },
  { id: 5, name: "Bạn bè", desc: "Mời bạn học" }
];

export default function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
  const profileState = useSelector((state: any) => state.profile);
  const currentUserId = Number(localStorage.getItem("userId"));
  const curriculumId = profileState?.profileData?.profile?.cohort?.curriculum?.curriculumId || 1;

  // Wizard state
  const [step, setStep] = useState<StepId>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [groupName, setGroupName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Academic Info
  const [mainSubject, setMainSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Step 3: Group Settings
  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  // Step 4: Schedule & Invite Friends
  const [freeTime, setFreeTime] = useState<FreeTime>(() => initFreeTime());
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  // Load subjects
  useEffect(() => {
    if (!open) return;
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await getAllSubjectsByCurriculum(curriculumId);
        setSubjects(response.data || []);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [open, curriculumId]);

  // Load friends
  useEffect(() => {
    if (!open || step !== 5) return;
    const loadFriends = async () => {
      setLoadingFriends(true);
      try {
        const response = await getFriendsListService();
        setFriends(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load friends:", error);
      } finally {
        setLoadingFriends(false);
      }
    };
    loadFriends();
  }, [open, step]);

  if (!open) return null;

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Filter friends list
  const filteredFriends = friends.filter((friend) =>
    friend.full_name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  );

  // Toggle friend invitation
  const handleToggleInvite = (userId: number) => {
    setInvitedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!groupName.trim()) {
        toast.error("Vui lòng nhập tên nhóm");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!mainSubject) {
        toast.error("Vui lòng chọn môn học chính");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as StepId);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    if (!mainSubject) {
      toast.error("Vui lòng chọn môn học chính");
      return;
    }

    const validSlotCodes = new Set(["ca1", "ca2", "ca3", "ca4", "ca5", "ca6"]);
    const freeTimeSlots: FreeTimeSlotRequest[] = Object.entries(freeTime).flatMap(([dayKey, slots]) => {
      const dayNumber = Number(dayKey);
      if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 6) {
        return [];
      }
      const dayOfWeek = dayNumber as DayOfWeek;
      return Object.entries(slots as Record<string, boolean>)
        .filter(([slotCodeKey]) => validSlotCodes.has(slotCodeKey))
        .filter(([, isAvailable]) => Boolean(isAvailable))
        .map(([slotCodeKey]) => ({
          dayOfWeek,
          slotCode: slotCodeKey as SlotCode,
          isAvailable: true,
        }));
    });

    const payload: CreateStudyGroupRequest = {
      name: groupName.trim(),
      description: goalDescription.trim(),
      ownerUserId: currentUserId,
      mainSubjectId: Number(mainSubject.subjectId),
      subjectName: mainSubject.subjectName,
      maxMembers,
      visibility,
      freeTimeSlots,
      invitedUserIds: invitedUserIds.length > 0 ? invitedUserIds : undefined,
    };

    setIsSubmitting(true);
    try {
      const res = await createStudyGroup(payload, avatarFile || undefined);
      if (res.success) {
        toast.success("Tạo nhóm thành công!");
        onCreated();
        handleClose();
      } else {
        toast.error("Tạo nhóm thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo nhóm");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGroupName("");
    setGoalDescription("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setMainSubject(null);
    setMaxMembers(5);
    setVisibility("public");
    setFreeTime(initFreeTime());
    setInvitedUserIds([]);
    setFriendSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 px-4 py-6">
      <div className="w-full max-h-[calc(100vh-80px)] max-w-3xl rounded-xl bg-white shadow-xl flex flex-col overflow-hidden">

        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Tạo nhóm học tập</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="border-b border-gray-100 bg-gray-50/50 py-2.5 shrink-0 select-none">
          <div className="mx-auto flex max-w-md items-center justify-between px-4">
            {STEPS.map((s, index) => (
              <React.Fragment key={s.id}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${step === s.id
                    ? "bg-blue-500 text-white scale-105 shadow-sm"
                    : step > s.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                  {s.id}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-3 transition-all ${step > s.id ? "bg-blue-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {step === 1 && (
            <div className="space-y-6">
              {/* Centered Avatar Uploader */}
              <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-5">
                <div
                  className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-150 transition-colors group shadow-inner"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Group Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-2.5 text-xs font-bold text-blue-500 hover:text-blue-600 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Tải ảnh đại diện nhóm
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Stacked Form Inputs */}
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">Tên nhóm</span>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="v.d. Nhóm ôn tập giải tích 1"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                    required
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-gray-700">Mô tả mục tiêu</span>
                  <textarea
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="Mô tả mục tiêu tập trung của nhóm học này..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-4 min-h-[220px]">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Môn học chính của nhóm</span>
                {loadingSubjects ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                    <CircularProgress size={16} /> Đang tải danh sách môn học...
                  </div>
                ) : (
                  <Autocomplete
                    options={subjects}
                    getOptionLabel={(option) => option.subjectName}
                    value={mainSubject}
                    onChange={(_, newValue) => setMainSubject(newValue)}
                    noOptionsText="Không tìm thấy môn học nào"
                    slotProps={{
                      listbox: {
                        style: {
                          maxHeight: "180px",
                        },
                      },
                      popper: {
                        sx: {
                          zIndex: 11000,
                        },
                      },
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm môn học..."
                        size="small"
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                            backgroundColor: "#ffffff",
                            minHeight: "42px",
                            "& fieldset": { borderColor: "#e5e7eb" },
                            "&:hover fieldset": { borderColor: "#d1d5db" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#2563eb",
                              borderWidth: "1px",
                            },
                          },
                        }}
                      />
                    )}
                  />
                )}
              </label>

              {mainSubject && (
                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 mt-3 flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-700">Môn học đã chọn: {mainSubject.subjectName}</h4>
                    <p className="text-xs text-blue-600 mt-1">
                      Mã môn học: {mainSubject.subjectCode || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Group Settings */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Max Members */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  Số lượng thành viên tối đa (từ 3 đến 10)
                </label>

                {/* Compact grid selectors for member counts */}
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxMembers(num)}
                      className={`h-10 rounded-lg border text-sm font-bold transition-all cursor-pointer ${maxMembers === num
                          ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/30"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Card options */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-700 block">Quyền riêng tư nhóm</span>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Public Card Option */}
                  <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${visibility === "public"
                      ? "border-blue-500 bg-blue-50/20"
                      : "border-gray-150 bg-gray-50/30 hover:bg-gray-50/80"
                    }`}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="mt-1 text-blue-500 focus:ring-blue-100"
                    />
                    <div>
                      <span className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                        <Globe className="h-4 w-4 text-blue-500" /> Công khai
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                        Nhóm hiển thị trên tìm kiếm. Sinh viên cùng trường có thể gửi yêu cầu tham gia.
                      </span>
                    </div>
                  </label>

                  {/* Private Card Option */}
                  <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${visibility === "private"
                      ? "border-blue-500 bg-blue-50/20"
                      : "border-gray-150 bg-gray-50/30 hover:bg-gray-50/80"
                    }`}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                      className="mt-1 text-blue-500 focus:ring-blue-100"
                    />
                    <div>
                      <span className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                        <Lock className="h-4 w-4 text-blue-600" /> Riêng tư
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                        Ẩn khỏi tìm kiếm. Chỉ những sinh viên nhận được link mời trực tiếp mới có thể tham gia.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Group Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 block">Thời gian rảnh dự kiến của nhóm</span>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <FreeTimePicker value={freeTime} onChange={setFreeTime} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Invite Friends */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">Mời bạn bè tham gia nhóm (Tùy chọn)</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Gửi lời mời tham gia nhóm học ngay khi nhóm được tạo thành công
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    placeholder="Tìm bạn bè..."
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
                  />
                </div>

                {invitedUserIds.length > 0 && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1.5">
                      Bạn học đã chọn ({invitedUserIds.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {invitedUserIds.map((userId) => {
                        const friend = friends.find((f) => f.user_id === userId);
                        return (
                          <span
                            key={userId}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                          >
                            {friend?.full_name || `User #${userId}`}
                            <button
                              type="button"
                              onClick={() => handleToggleInvite(userId)}
                              className="ml-1 hover:text-blue-900 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-2 bg-white">
                  {loadingFriends ? (
                    <div className="flex items-center justify-center py-6 text-sm text-gray-400 gap-2">
                      <CircularProgress size={16} /> Đang tải danh sách bạn bè...
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">
                      Không tìm thấy bạn học phù hợp
                    </div>
                  ) : (
                    filteredFriends.map((friend) => {
                      const isInvited = invitedUserIds.includes(friend.user_id);
                      return (
                        <div
                          key={friend.user_id}
                          className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/30 p-2.5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {friend.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                alt={friend.full_name}
                                className="h-8 w-8 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                                {friend.full_name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {friend.full_name}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                Bạn học của tôi
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleInvite(friend.user_id)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${isInvited
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                              }`}
                          >
                            {isInvited ? "Đã chọn" : "Chọn"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} /> Quay lại
              </button>
            )}
          </div>

          <div>
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Tiếp theo <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang tạo nhóm...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Tạo nhóm
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
