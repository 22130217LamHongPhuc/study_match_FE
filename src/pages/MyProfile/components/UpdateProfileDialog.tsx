import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { loadProfileByUserId } from "../../../redux/ProfileReducer";
import { AppDispatch, RootState } from "../../../redux/store";
import { ProfileApiResponse, ProfileViewModel } from "../types";
import {
  FormData,
  Cohort,
  StudyPlan,
  StudyPlanOptions,
  TermSelection,
  FreeTime,
  initFreeTime,
  syncModuleSlots,
  Step1,
  Step2,
  Step3Goal,
  Step3Mode,
  Step4CurrentPlan,
  Step5,
  Step6,
  Step7,
  DAYS,
} from "../../Onboarding/components";
import {
  transformFormDataToPayload,
  createSubjectCodeToIdMap,
} from "../../../services/OnboardingService";
import { updateProfile } from "../../../services/ProfileService";
import { apiFetch } from "../../../config/apiClient";
const API_BASE_URL = "http://localhost:8082/api";

function convertFreeTimeFromProfile(profile: ProfileViewModel): FreeTime {
  const freeTime = initFreeTime();

  profile.freeTimeGroups?.forEach((group) => {
    if (freeTime[group.dayId]) {
      group.slots.forEach((slot) => {
        (freeTime[group.dayId] as any)[slot.id] = true;
      });
    }
  });

  return freeTime;
}

function getGenderDefault(profile: ProfileViewModel): "M" | "F" | "" {
  const normalized = profile.gender?.toLowerCase();
  if (normalized === "male" || normalized === "nam") return "M";
  if (normalized === "female" || normalized === "nu" || normalized === "nữ") {
    return "F";
  }
  return "";
}

function getStudyModeDefault(profile: ProfileViewModel): FormData["studyMode"] {
  const normalized = profile.studyModeLabel?.toLowerCase() || "";
  if (normalized.includes("tương đồng") || normalized.includes("mutual")) {
    return "mutual_support";
  }
  if (normalized.includes("đồng") || normalized.includes("peer")) {
    return "peer_support";
  }
  if (normalized.includes("đối kháng") || normalized.includes("challenge")) {
    return "challenge";
  }
  if (normalized.includes("bổ trợ") || normalized.includes("support")) {
    return "support";
  }
  return "";
}

function getStudyGoalDefault(profile: ProfileViewModel): FormData["studyGoal"] {
  const goal = profile.studyGoal || "";
  return goal === "Survivor" ||
    goal === "Passive Learner" ||
    goal === "Standard Learner" ||
    goal === "High Achiever"
    ? goal
    : "";
}

function getCurrentTermSelection(
  profileData: ProfileApiResponse,
): TermSelection | null {
  const termProfile = profileData.termProfiles?.[0];
  if (!termProfile?.term) return null;

  return {
    studyYearNo: termProfile.studyYearNo,
    semesterNo: termProfile.semesterNo,
    startYearTerm: termProfile.term.academicYearStart,
    endYearTerm: termProfile.term.academicYearEnd,
    displayLabel: termProfile.term.fullName,
  };
}

function convertModuleSlotsFromProfile(
  profile: ProfileViewModel,
): Record<string, FreeTime> {
  const moduleSlots: Record<string, FreeTime> = {};

  const allModules = Array.from(
    new Set([
      ...(profile.scheduleRows || []).flatMap((row) =>
        row.cells.flatMap((cell) =>
          cell.classes.map((scheduleClass) => scheduleClass.subjectCode),
        ),
      ),
      ...(profile.enrolledSubjects || []).map((subject) => subject.subjectCode),
    ]),
  ).filter(Boolean);

  allModules.forEach((moduleCode) => {
    moduleSlots[moduleCode] = initFreeTime();
  });

  profile.scheduleRows?.forEach((row) => {
    row.cells?.forEach((cell) => {
      if (cell.classes && cell.classes.length > 0) {
        cell.classes.forEach((scheduleClass) => {
          if (moduleSlots[scheduleClass.subjectCode]) {
            (moduleSlots[scheduleClass.subjectCode][cell.dayId] as any)[
              row.slot.id
            ] = true;
          }
        });
      }
    });
  });

  return moduleSlots;
}

interface UpdateProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileViewModel;
}

export default function UpdateProfileDialog({
  open,
  onClose,
  profile,
}: UpdateProfileDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );
  const [step, setStep] = useState<number>(1);
  const [goalSub, setGoalSub] = useState<number>(1);

  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState<boolean>(false);
  const [cohortsError, setCohortsError] = useState<string>("");

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [studyPlanLoading, setStudyPlanLoading] = useState<boolean>(false);
  const [studyPlanError, setStudyPlanError] = useState<string>("");

  const [studyPlanOptions, setStudyPlanOptions] =
    useState<StudyPlanOptions | null>(null);
  const [studyPlanOptionsLoading, setStudyPlanOptionsLoading] =
    useState<boolean>(false);
  const [studyPlanOptionsError, setStudyPlanOptionsError] =
    useState<string>("");

  const [mainTermSelection, setMainTermSelection] =
    useState<TermSelection | null>(null);
  const [enrolledTermSelection, setEnrolledTermSelection] =
    useState<TermSelection | null>(null);

  const [mainTermStudyPlan, setMainTermStudyPlan] = useState<StudyPlan | null>(
    null,
  );
  const [mainTermStudyPlanLoading, setMainTermStudyPlanLoading] =
    useState<boolean>(false);
  const [mainTermStudyPlanError, setMainTermStudyPlanError] =
    useState<string>("");

  const [enrolledTermStudyPlan, setEnrolledTermStudyPlan] =
    useState<StudyPlan | null>(null);
  const [enrolledTermStudyPlanLoading, setEnrolledTermStudyPlanLoading] =
    useState<boolean>(false);
  const [enrolledTermStudyPlanError, setEnrolledTermStudyPlanError] =
    useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  const [data, setData] = useState<FormData>({
    fullName: "",
    studentId: "",
    gender: "" as "M" | "F" | "",
    ageGroup: "" as "0-35" | "35-55" | "55<=" | "",
    region: "",
    studyGoal: "",
    studyMode: "",
    cohortCode: "",
    mainModule: "",
    enrolledModules: [],
    moduleSlots: {},
    freeTime: initFreeTime(),
    avgScore: 8.0,
    prevAttempts: 0,
    studiedCredits: "",
  });

  useEffect(() => {
    if (!open) return;

    const dataSource = profileData;
    if (!dataSource) {
      if (!profile) return;

      setData({
        fullName: profile.fullName || "",
        studentId: profile.studentCode || "",
        gender: getGenderDefault(profile),
        ageGroup: (profile.ageGroup as "0-35" | "35-55" | "55<=" | "") || "",
        region: profile.region || "",
        studyGoal: getStudyGoalDefault(profile),
        studyMode: getStudyModeDefault(profile),
        cohortCode: "",
        mainModule: String(profile.mainSubjectId || ""),
        enrolledModules:
          profile.enrolledSubjects?.map((s) => s.subjectCode) || [],
        moduleSlots: convertModuleSlotsFromProfile(profile),
        freeTime: convertFreeTimeFromProfile(profile),
        avgScore: profile.avgScore ?? 8.0,
        prevAttempts: 0,
        studiedCredits: String(profile.studiedCredits ?? ""),
      });

      setStep(1);
      setGoalSub(1);
      return;
    }

    const profileVm = profile;
    const currentTerm = dataSource.termProfiles?.[0];
    const mainSubjectCode =
      dataSource.scheduleSlots?.find(
        (slot) => slot.scheduleType === "MAIN_SUBJECT",
      )?.subject.subjectCode ||
      String(currentTerm?.mainSubjectId || profileVm.mainSubjectId || "");
    const enrolledSubjectCodes = Array.from(
      new Set(
        dataSource.scheduleSlots
          ?.filter((slot) => slot.scheduleType === "CURRENT_TERM")
          .map((slot) => slot.subject.subjectCode)
          .concat(
            dataSource.enrollments?.map((item) => item.subject.subjectCode) ||
              [],
          ) || [],
      ),
    ).filter((code) => code && code !== mainSubjectCode);

    const profileForSchedule: ProfileViewModel = {
      ...profileVm,
      gender: dataSource.profile.gender,
      cohortLabel: `Khoa ${dataSource.profile.cohort.cohortCode} (${dataSource.profile.cohort.startAcademicYear})`,
      studyGoal: currentTerm?.studyGoal || profileVm.studyGoal,
      studyModeLabel: currentTerm?.studyMode || profileVm.studyModeLabel,
      mainSubjectId: currentTerm?.mainSubjectId || profileVm.mainSubjectId,
      mainSubjectName:
        currentTerm?.mainSubjectName || profileVm.mainSubjectName,
      enrolledSubjects: dataSource.enrollments.map((item) => item.subject),
      freeTimeGroups: profileVm.freeTimeGroups,
      scheduleRows: profileVm.scheduleRows,
      dayHeaders: profileVm.dayHeaders,
      avgScore: currentTerm?.avgScore || profileVm.avgScore,
      studiedCredits: currentTerm?.studiedCredits || profileVm.studiedCredits,
      studyYearNo: currentTerm?.studyYearNo || profileVm.studyYearNo,
      semesterNo: currentTerm?.semesterNo || profileVm.semesterNo,
    };

    const currentTermSelection = getCurrentTermSelection(dataSource);

    setData({
      fullName: dataSource.profile.fullName || profileVm.fullName || "",
      studentId: dataSource.profile.studentCode || profileVm.studentCode || "",
      gender: getGenderDefault(profileForSchedule),
      ageGroup:
        (dataSource.profile.ageGroup as "0-35" | "35-55" | "55<=" | "") ||
        (profileVm.ageGroup as "0-35" | "35-55" | "55<=" | "") ||
        "",
      region: dataSource.profile.region || profileVm.region || "",
      studyGoal: getStudyGoalDefault(profileForSchedule),
      studyMode: getStudyModeDefault(profileForSchedule),
      cohortCode: String(dataSource.profile.cohort.cohortCode || ""),
      mainModule: mainSubjectCode,
      enrolledModules: enrolledSubjectCodes,
      moduleSlots: convertModuleSlotsFromProfile(profileForSchedule),
      freeTime: convertFreeTimeFromProfile(profileForSchedule),
      avgScore: currentTerm?.avgScore ?? profileVm.avgScore ?? 8.0,
      prevAttempts: 0,
      studiedCredits: String(
        currentTerm?.studiedCredits ?? profileVm.studiedCredits ?? "",
      ),
    });

    setMainTermSelection(currentTermSelection);
    setEnrolledTermSelection(currentTermSelection);

    setStep(1);
    setGoalSub(1);
  }, [open, profile, profileData]);

  const loadCohorts = useCallback(async () => {
    setCohortsLoading(true);
    setCohortsError("");
    try {
      const res = await apiFetch<Cohort[]>("/cohorts", { method: "GET" }, API_BASE_URL);
      if (!res.success) throw new Error(res.message || "Failed to load cohorts");
      setCohorts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setCohorts([]);
      setCohortsError(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách khóa",
      );
    } finally {
      setCohortsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadCohorts();
  }, [open, loadCohorts]);

  const loadStudyPlan = useCallback(async (cohortCode: string) => {
    if (!cohortCode) {
      setStudyPlan(null);
      return;
    }

    setStudyPlanLoading(true);
    setStudyPlanError("");
    try {
      const res = await apiFetch<StudyPlan>(
        `/cohorts/${cohortCode}/study-plan/current`,
        { method: "GET" },
        API_BASE_URL
      );
      if (!res.success) throw new Error(res.message || "Failed to load study plan");
      setStudyPlan(res.data);
    } catch (error) {
      setStudyPlan(null);
      setStudyPlanError(
        error instanceof Error ? error.message : "Không tải được môn học",
      );
    } finally {
      setStudyPlanLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyPlan(data.cohortCode);
  }, [data.cohortCode, loadStudyPlan]);

  const loadStudyPlanOptions = useCallback(async (cohortCode: string) => {
    if (!cohortCode) {
      setStudyPlanOptions(null);
      return;
    }

    setStudyPlanOptionsLoading(true);
    setStudyPlanOptionsError("");
    try {
      const res = await apiFetch<StudyPlanOptions>(
        `/cohorts/${cohortCode}/study-plan-options`,
        { method: "GET" },
        API_BASE_URL
      );
      if (!res.success) throw new Error(res.message || "Failed to load options");
      setStudyPlanOptions(res.data);
    } catch (error) {
      setStudyPlanOptions(null);
      setStudyPlanOptionsError(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách học kỳ",
      );
    } finally {
      setStudyPlanOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudyPlanOptions(data.cohortCode);
  }, [data.cohortCode, loadStudyPlanOptions]);

  const loadStudyPlanByTerm = useCallback(
    async (
      cohortCode: string,
      selection: TermSelection,
    ): Promise<StudyPlan> => {
      const params = new URLSearchParams({
        studyYearNo: String(selection.studyYearNo),
        semesterNo: String(selection.semesterNo),
        startYearTerm: String(selection.startYearTerm),
        endYearTerm: String(selection.endYearTerm),
      });

      const res = await apiFetch<StudyPlan>(
        `/cohorts/${cohortCode}/study-plan-options/subject?${params.toString()}`,
        { method: "GET" },
        API_BASE_URL
      );
      if (!res.success) throw new Error(res.message || "Failed to load subjects");
      return res.data;
    },
    [],
  );

  useEffect(() => {
    if (!data.cohortCode || !mainTermSelection) {
      setMainTermStudyPlan(null);
      return;
    }

    setMainTermStudyPlanLoading(true);
    setMainTermStudyPlanError("");
    loadStudyPlanByTerm(data.cohortCode, mainTermSelection)
      .then((plan) => setMainTermStudyPlan(plan))
      .catch((error) => {
        setMainTermStudyPlan(null);
        setMainTermStudyPlanError(
          error instanceof Error ? error.message : "Không tải được môn chính",
        );
      })
      .finally(() => setMainTermStudyPlanLoading(false));
  }, [data.cohortCode, mainTermSelection, loadStudyPlanByTerm]);

  useEffect(() => {
    if (!data.cohortCode || !enrolledTermSelection) {
      setEnrolledTermStudyPlan(null);
      return;
    }

    setEnrolledTermStudyPlanLoading(true);
    setEnrolledTermStudyPlanError("");
    loadStudyPlanByTerm(data.cohortCode, enrolledTermSelection)
      .then((plan) => setEnrolledTermStudyPlan(plan))
      .catch((error) => {
        setEnrolledTermStudyPlan(null);
        setEnrolledTermStudyPlanError(
          error instanceof Error ? error.message : "Không tải được môn phụ",
        );
      })
      .finally(() => setEnrolledTermStudyPlanLoading(false));
  }, [data.cohortCode, enrolledTermSelection, loadStudyPlanByTerm]);

  const update = useCallback(
    (key: keyof FormData, value: FormData[keyof FormData]) => {
      setData((p) => {
        if (key === "cohortCode") {
          setMainTermSelection(null);
          setEnrolledTermSelection(null);
          setMainTermStudyPlan(null);
          setEnrolledTermStudyPlan(null);
          return {
            ...p,
            cohortCode: value as string,
            mainModule: "",
            enrolledModules: [],
            moduleSlots: {},
          };
        }

        if (key === "mainModule") {
          const nextMainModule = value as string;
          const nextSelectedModules = [
            nextMainModule,
            ...(p.enrolledModules as string[]).filter(
              (code) => code !== nextMainModule,
            ),
          ].filter(Boolean);

          return {
            ...p,
            mainModule: nextMainModule,
            enrolledModules: (p.enrolledModules as string[]).filter(
              (code) => code !== nextMainModule,
            ),
            moduleSlots: syncModuleSlots(p.moduleSlots, nextSelectedModules),
          };
        }

        if (key === "enrolledModules") {
          const normalizedEnrolledModules = Array.isArray(value)
            ? value.filter(
                (moduleCode): moduleCode is string =>
                  typeof moduleCode === "string",
              )
            : [];

          const nextSelectedModules = [
            p.mainModule,
            ...normalizedEnrolledModules.filter(
              (code) => code !== p.mainModule,
            ),
          ].filter(Boolean);

          return {
            ...p,
            enrolledModules: normalizedEnrolledModules.filter(
              (code) => code !== p.mainModule,
            ),
            moduleSlots: syncModuleSlots(p.moduleSlots, nextSelectedModules),
          };
        }

        return { ...p, [key]: value };
      });
    },
    [],
  );

  const canProceed = (): boolean => {
    if (step === 1) {
      return !!(
        data.fullName.trim() &&
        data.studentId.trim() &&
        data.cohortCode
      );
    }
    if (step === 2) return !!(data.gender && data.region);
    if (step === 3) return goalSub === 1 ? !!data.studyGoal : !!data.studyMode;
    if (step === 4) {
      if (!(data.mainModule && studyPlan)) return false;
      const selectedModules = [data.mainModule, ...data.enrolledModules].filter(
        Boolean,
      );
      return selectedModules.every((moduleCode) =>
        DAYS.some((day) =>
          Object.values(data.moduleSlots[moduleCode]?.[day.id] ?? {}).some(
            Boolean,
          ),
        ),
      );
    }
    if (step === 5) {
      return DAYS.some((d) => Object.values(data.freeTime[d.id]).some(Boolean));
    }
    if (step === 6) return data.studiedCredits !== "";
    return true;
  };

  const handleNext = async () => {
    if (step === 3) {
      if (goalSub === 1) return setGoalSub(2);
      setGoalSub(1);
      return setStep(4);
    }
    if (step === 4) return setStep(5);
    if (step === 7) {
      setSubmitting(true);
      setSubmitError("");

      try {
        const subjectCodeToIdMap = createSubjectCodeToIdMap([
          studyPlan,
          mainTermStudyPlan,
          enrolledTermStudyPlan,
        ]);
        const payload = transformFormDataToPayload(
          data,
          cohorts,
          studyPlan,
          subjectCodeToIdMap,
        );

        const result = await updateProfile(payload);
        setSubmitting(false);

        if (result.success) {
          const userId = Number(localStorage.getItem("userId"));
          dispatch(loadProfileByUserId(userId));
          onClose();
        } else {
          setSubmitError(result.error || "Lỗi khi lưu dữ liệu");
        }
      } catch (error) {
        setSubmitting(false);
        setSubmitError(
          error instanceof Error ? error.message : "Lỗi khi lưu dữ liệu",
        );
      }
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 3 && goalSub === 2) return setGoalSub(1);
    if (step === 4) return setStep(3);
    if (step > 1) setStep((s) => s - 1);
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            data={data}
            update={update}
            cohorts={cohorts}
            cohortsLoading={cohortsLoading}
            cohortsError={cohortsError}
            onRetry={loadCohorts}
          />
        );
      case 2:
        return <Step2 data={data} update={update} />;
      case 3:
        return goalSub === 1 ? (
          <Step3Goal data={data} update={update} />
        ) : (
          <Step3Mode data={data} update={update} />
        );
      case 4:
        return (
          <Step4CurrentPlan
            data={data}
            update={update}
            studyPlan={studyPlan}
            studyPlanLoading={studyPlanLoading}
            studyPlanError={studyPlanError}
            studyPlanOptions={studyPlanOptions}
            studyPlanOptionsLoading={studyPlanOptionsLoading}
            studyPlanOptionsError={studyPlanOptionsError}
            mainTermSelection={mainTermSelection}
            enrolledTermSelection={enrolledTermSelection}
            setMainTermSelection={setMainTermSelection}
            setEnrolledTermSelection={setEnrolledTermSelection}
            mainTermStudyPlan={mainTermStudyPlan}
            mainTermStudyPlanLoading={mainTermStudyPlanLoading}
            mainTermStudyPlanError={mainTermStudyPlanError}
            enrolledTermStudyPlan={enrolledTermStudyPlan}
            enrolledTermStudyPlanLoading={enrolledTermStudyPlanLoading}
            enrolledTermStudyPlanError={enrolledTermStudyPlanError}
          />
        );
      case 5:
        return <Step5 data={data} update={update} />;
      case 6:
        return <Step6 data={data} update={update} />;
      case 7:
        return <Step7 data={data} studyPlan={studyPlan} />;
      default:
        return null;
    }
  };

  const stepTitle = (): string => {
    if (step === 3) {
      return goalSub === 1
        ? "Trình độ học tập của bạn?"
        : "Cách bạn muốn học cùng người khác?";
    }

    return (
      (
        {
          1: "Xin chào! Hãy bắt đầu nào",
          2: "Thông tin cá nhân",
          4: "Khóa hiện tại và môn học của bạn",
          5: "Thời gian rảnh của bạn",
          6: "Kết quả học tập",
          7: "Xem lại hồ sơ của bạn",
        } as Record<number, string>
      )[step] ?? ""
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        {stepTitle()}
        {step === 3 && (
          <Box sx={{ mt: 0.5, fontSize: "0.875rem", color: "#888" }}>
            {goalSub === 1
              ? "Bước 1/2 – Chọn trình độ"
              : "Bước 2/2 – Chọn phương thức"}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ minHeight: 400, py: 3 }}>
        {submitting && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        {!submitting && (
          <Box sx={{ fontSize: "0.875rem" }}>{renderContent()}</Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={submitting}>
          Huỷ
        </Button>
        {step > 1 && (
          <Button onClick={handleBack} disabled={submitting}>
            Quay lại
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canProceed() || submitting}
        >
          {step === 7 ? "Lưu" : "Tiếp theo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
