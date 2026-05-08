import { useState } from "react";
import { initFreeTime } from "../Onboarding/components/constants";
import type {
  FreeTime,
  StudyGoal,
  StudyMode,
  Subject,
} from "../Onboarding/components/types";
import BasicInfoSection from "./components/BasicInfoSection";
import AcademicInfoSection from "./components/AcademicInfoSection";
import MatchingCriteriaSection from "./components/MatchingCriteriaSection";
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
import { VALID_MODES } from "../Onboarding/components/constants";

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<string>("");
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [mainSubject, setMainSubject] = useState<Subject | null>(null);

  const [studyGoal, setStudyGoal] = useState<StudyGoal | "">("");
  const [studyMode, setStudyMode] = useState<StudyMode | "">("");

  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [freeTime, setFreeTime] = useState<FreeTime>(() => initFreeTime());
  const profileState = useSelector((state: any) => state.profile);
  if (profileState.loading) {
    return <div>Loading...</div>;
  }

  const handleCreateGroup = async () => {
    const ownerUserId = Number(localStorage.getItem("userId"));
    const mainSubjectId = Number(mainSubject?.subjectId);

    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm");
      return;
    }
    if (!Number.isFinite(ownerUserId) || ownerUserId <= 0) {
      alert("Không tìm thấy userId. Vui lòng đăng nhập lại.");
      return;
    }
    if (!Number.isFinite(mainSubjectId) || mainSubjectId <= 0) {
      alert("Vui lòng chọn môn học chính");
      return;
    }
    if (!studyGoal || !studyMode) {
      alert("Vui lòng chọn Study Goal và Study Mode");
      return;
    }

    const allowedModes = VALID_MODES[studyGoal] ?? [];
    if (!allowedModes.includes(studyMode)) {
      alert("Study Mode không hợp lệ cho Study Goal đã chọn");
      return;
    }
    if (!Number.isFinite(maxMembers) || maxMembers < 1) {
      alert("Số lượng thành viên tối đa không hợp lệ");
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
      studyGoal,
      studyMode,
      maxMembers,
      visibility,
      freeTimeSlots,
    };
    console.log("CreateGroupPage - payload:", payload);

    const res = await createStudyGroup(payload);
    if (res.success) {
      alert("Tạo nhóm thành công");
      navigate("/groups");
      return;
    } else {
      alert("Tạo nhóm thất bại: " + (res.message || "Lỗi không xác định"));
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

            <MatchingCriteriaSection
              goal={studyGoal}
              mode={studyMode}
              onChange={(next) => {
                setStudyGoal(next.goal);
                setStudyMode(next.mode);
              }}
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
              studyGoal,
              studyMode,
              maxMembers,
              visibility,
              freeTime,
            }}
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
