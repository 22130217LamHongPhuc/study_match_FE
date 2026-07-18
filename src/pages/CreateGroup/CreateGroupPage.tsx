import { useState } from "react";
import { initFreeTime } from "../Onboarding/components/constants";
import type { FreeTime, Subject } from "../Onboarding/components/types";
import BasicInfoSection from "./components/BasicInfoSection";
import AcademicInfoSection from "./components/AcademicInfoSection";
import GroupSettingsSection from "./components/GroupSettingsSection";
import GroupPreviewSidebar from "./components/GroupPreviewSidebar";
import BottomActionBar from "./components/BottomActionBar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createStudyGroup,
  type CreateStudyGroupRequest,
  type DayOfWeek,
  type FreeTimeSlotRequest,
  type SlotCode,
} from "../../services/GroupService";
import { toast } from "react-toastify";
export function CreateGroupSkeleton() {
  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 animate-pulse">
      <main className="mx-auto max-w-6xl px-6 py-8 pb-32">
        <header className="mb-10">
          <div className="h-10 w-64 bg-slate-200 rounded-md mb-4" />
          <div className="h-6 max-w-2xl bg-slate-200 rounded-md" />
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="h-[400px] bg-slate-200/50 rounded-2xl" />
            <div className="h-[300px] bg-slate-200/50 rounded-2xl" />
            <div className="h-[500px] bg-slate-200/50 rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-[600px] bg-slate-200/50 rounded-2xl sticky top-8" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<string>("");
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [mainSubject, setMainSubject] = useState<Subject | null>(null);
  const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [freeTime, setFreeTime] = useState<FreeTime>(() => initFreeTime());
  const profileState = useSelector((state: any) => state.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (profileState.loading || isSubmitting) {
    return <CreateGroupSkeleton />;
  }

  const handleCreateGroup = async () => {
    const ownerUserId = Number(localStorage.getItem("userId"));
    const mainSubjectId = Number(mainSubject?.subjectId);

    if (!groupName.trim()) {
      console.log("Validation failed: groupName is empty");
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    if (!Number.isFinite(ownerUserId) || ownerUserId <= 0) {
      toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }
    if (!Number.isFinite(mainSubjectId) || mainSubjectId <= 0) {
      toast.error("Vui lòng chọn môn học chính");
      return;
    }
    if (!Number.isFinite(maxMembers) || maxMembers < 1) {
      toast.error("Số lượng thành viên tối đa không hợp lệ");
      return;
    }

    const validSlotCodes = new Set(["ca1", "ca2", "ca3", "ca4", "ca5", "ca6"]);

    const freeTimeSlots: FreeTimeSlotRequest[] = Object.entries(
      freeTime,
    ).flatMap(([dayKey, slots]) => {
      const dayNumber = Number(dayKey);
      if (!Number.isInteger(dayNumber) || dayNumber < 0 || dayNumber > 6) {
        return [];
      }

      const dayOfWeek = dayNumber as DayOfWeek;

      return Object.entries(slots as Record<string, boolean>)
        .filter(([slotCodeKey]) => validSlotCodes.has(slotCodeKey))
        .filter(([, isAvailable]) => Boolean(isAvailable))
        .map(([slotCodeKey, isAvailable]) => ({
          dayOfWeek,
          slotCode: slotCodeKey as SlotCode,
          isAvailable: Boolean(isAvailable),
        }));
    });

    const payload: CreateStudyGroupRequest = {
      name: groupName.trim(),
      description: goalDescription?.trim() || "",
      ownerUserId,
      mainSubjectId,
      subjectName: mainSubject?.subjectName || "",
      maxMembers,
      visibility,
      freeTimeSlots,
      invitedUserIds: invitedUserIds.length > 0 ? invitedUserIds : undefined,
    };
    console.log("CreateGroupPage - payload:", payload);

    setIsSubmitting(true);
    try {
      const res = await createStudyGroup(payload, avatarFile || undefined);
      if (res.success) {
        navigate("/groups");
        return;
      } else {
        toast.error(
          "Tạo nhóm thất bại: " + (res.message || "Lỗi không xác định"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
      <main className="mx-auto max-w-6xl px-6 py-8 pb-32">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Tạo nhóm học tập
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
            Thiết lập nhóm học tập dựa trên môn học, mục tiêu, hình thức và thời
            gian rảnh.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <BasicInfoSection
              groupName={groupName}
              goalDescription={goalDescription}
              avatarPreview={avatarPreview}
              onAvatarChange={(file, preview) => {
                setAvatarFile(file);
                setAvatarPreview(preview);
              }}
              onChange={(next) => {
                setGroupName(next.groupName);
                setGoalDescription(next.goalDescription);
              }}
            />

            <AcademicInfoSection
              mainSubject={mainSubject}
              onMainSubjectChange={setMainSubject}
              curriculumId={
                profileState?.profileData?.profile.cohort.curriculum
                  .curriculumId || null
              }
            />

            <GroupSettingsSection
              maxMembers={maxMembers}
              onMaxMembersChange={setMaxMembers}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              freeTime={freeTime}
              onFreeTimeChange={setFreeTime}
            />
          </div>

          <GroupPreviewSidebar
            draft={{
              groupName,
              goalDescription,
              mainSubject: mainSubject?.subjectName || "",
              maxMembers,
              visibility,
              freeTime,
              avatarPreview,
            }}
            invitedUserIds={invitedUserIds}
            onInvitedUserIdsChange={setInvitedUserIds}
          />
        </div>
      </main>

      <BottomActionBar
        onCancel={() => navigate(-1)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
