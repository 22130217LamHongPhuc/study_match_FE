import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Autocomplete, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import CommunityGroupCard from "./CommunityGroupCard";
import JoinGroupRequestModal from "./JoinGroupRequestModal";
import {
  browseGroups,
  BrowseGroupResponse,
  getAllSubjects,
  requestJoinGroup,
  rejectGroupInvitation,
  getSentPendingGroupJoinRequests,
  Subject,
} from "../../../services/GroupService";
import { RootState } from "../../../redux/store";
import { LoadingState, EmptyState } from "./SharedStates";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "STUDY" | "PRIVATE" | "PUBLIC";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount?: number;
  status: CommunityGroupStatus;
  type?: CommunityGroupType;
  visibility?: "PUBLIC" | "PRIVATE" | "COMMUNITY";
  createdAt: string;
  isMember: boolean;
  avatarUrl?: string | null;
  isJoinRequestPending?: boolean;
  description?: string | null;
}

function mapBrowseGroupToCommunityGroup(item: BrowseGroupResponse): CommunityGroup {
  const normalizedStatus: CommunityGroupStatus =
    item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  return {
    id: item.id,
    name: item.name,
    subjectName: item.subjectName ?? "-",
    memberCount: item.memberCount ?? undefined,
    status: normalizedStatus,
    type: (item.visibility as CommunityGroupType) ?? "COMMUNITY",
    createdAt: item.createdAt,
    isMember: item.member || false,
    avatarUrl: item.avatarUrl,
    isJoinRequestPending: item.joinRequestPending || false,
    description: item.description,
  };
}

function isJoinRequestPendingConflict(message?: string): boolean {
  return Boolean(message?.toLowerCase().includes("already pending"));
}

export function CommunityGroupCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-100 rounded" />
      </div>
      <div className="mt-3">
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function SuggestedGroupsSection() {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);

  const currentUserId = profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);
  const suggestedSubjectId = profileVm?.mainSubjectId ?? 0;
  const suggestedSubjectName = profileVm?.mainSubjectName ?? "-";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [recommendedGroups, setRecommendedGroups] = useState<CommunityGroup[]>([]);
  const [recommendedGroupsLoading, setRecommendedGroupsLoading] = useState(false);
  const [recommendedGroupsError, setRecommendedGroupsError] = useState<string | null>(null);

  const [selectedOtherSubjectId, setSelectedOtherSubjectId] = useState<number | "">("");
  const [selectedOtherGroups, setSelectedOtherGroups] = useState<CommunityGroup[]>([]);
  const [selectedOtherGroupsLoading, setSelectedOtherGroupsLoading] = useState(false);
  const [selectedOtherGroupsError, setSelectedOtherGroupsError] = useState<string | null>(null);

  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [selectedJoinGroup, setSelectedJoinGroup] = useState<CommunityGroup | null>(null);

  const handleOpenJoinModal = useCallback(
    (groupId: number) => {
      const group =
        recommendedGroups.find((item) => item.id === groupId) ||
        selectedOtherGroups.find((item) => item.id === groupId) ||
        null;
      setSelectedJoinGroup(group);
    },
    [recommendedGroups, selectedOtherGroups],
  );

  const handleSubmitJoinRequest = useCallback(
    async (message: string) => {
      if (!selectedJoinGroup) return;
      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      const groupId = selectedJoinGroup.id;
      if (joiningGroupId === groupId) return;

      setJoiningGroupId(groupId);

      try {
        const response = await requestJoinGroup(groupId, currentUserId, message);

        if (!response.success) {
          if (isJoinRequestPendingConflict(response.message)) {
            setRecommendedGroups((prev) =>
              prev.map((g) =>
                g.id === groupId ? { ...g, isJoinRequestPending: true } : g,
              ),
            );

            setSelectedOtherGroups((prev) =>
              prev.map((g) =>
                g.id === groupId ? { ...g, isJoinRequestPending: true } : g,
              ),
            );
            setSelectedJoinGroup(null);
            return;
          }

          toast.error(response.message || "Gửi yêu cầu tham gia nhóm thất bại.");
          return;
        }

        setRecommendedGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, isJoinRequestPending: true }
              : g,
          ),
        );

        setSelectedOtherGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, isJoinRequestPending: true }
              : g,
          ),
        );
        setSelectedJoinGroup(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        if (isJoinRequestPendingConflict(message)) {
          setRecommendedGroups((prev) =>
            prev.map((g) =>
              g.id === groupId ? { ...g, isJoinRequestPending: true } : g,
            ),
          );

          setSelectedOtherGroups((prev) =>
            prev.map((g) =>
              g.id === groupId ? { ...g, isJoinRequestPending: true } : g,
            ),
          );
          setSelectedJoinGroup(null);
          return;
        }

        toast.error(message);
      } finally {
        setJoiningGroupId((prev) => (prev === groupId ? null : prev));
      }
    },
    [currentUserId, joiningGroupId, selectedJoinGroup],
  );

  const handleCancelJoinRequest = useCallback(
    async (groupId: number) => {
      try {
        const res = await getSentPendingGroupJoinRequests();
        const pending = (res.data ?? []).find((inv) => inv.groupId === groupId);
        if (!pending) {
          toast.error("Không tìm thấy yêu cầu tham gia.");
          return;
        }
        await rejectGroupInvitation(pending.invitationId);
        setRecommendedGroups((prev) =>
          prev.map((g) => g.id === groupId ? { ...g, isJoinRequestPending: false } : g)
        );
        setSelectedOtherGroups((prev) =>
          prev.map((g) => g.id === groupId ? { ...g, isJoinRequestPending: false } : g)
        );
        toast.success("Đã hủy yêu cầu tham gia nhóm.");
        window.dispatchEvent(new Event("group_invitations_updated"));
      } catch (err) {
        toast.error("Hủy yêu cầu thất bại.");
      }
    },
    [],
  );


  const otherSubjects = useMemo(() => {
    if (subjects.length === 0) return [];

    return subjects.filter((subject) => subject.subjectId !== suggestedSubjectId);
  }, [subjects, suggestedSubjectId]);

  const fetchSubjects = useCallback(async () => {
    setSubjectsError(null);

    try {
      const response = await getAllSubjects();

      if (!response.success) {
        throw new Error(response.message || "Không thể tải danh sách môn học.");
      }

      setSubjects(response.data ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setSubjects([]);
      setSubjectsError(errorMessage);
    }
  }, []);

  const fetchCommunityGroupsForSubject = useCallback(
    async (
      subjectId: number,
      onStart: () => void,
      onSuccess: (groups: CommunityGroup[]) => void,
      onError: (message: string) => void,
      onFinally: () => void,
    ) => {
      onStart();

      try {
        const response = await browseGroups("COMMUNITY", subjectId, 0, 10);

        if (!response.success) {
          throw new Error(response.message || "Không thể tải danh sách nhóm.");
        }

        const content = response.data?.content ?? [];
        const mapped = content.map(mapBrowseGroupToCommunityGroup);
        const filtered = mapped.filter((g) => g.visibility !== "PRIVATE");
        onSuccess(filtered);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        onError(errorMessage);
      } finally {
        onFinally();
      }
    },
    [],
  );

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (!suggestedSubjectId) {
      setRecommendedGroups([]);
      return;
    }

    fetchCommunityGroupsForSubject(
      suggestedSubjectId,
      () => {
        setRecommendedGroupsLoading(true);
        setRecommendedGroupsError(null);
      },
      (groups) => setRecommendedGroups(groups),
      (message) => {
        setRecommendedGroups([]);
        setRecommendedGroupsError(message);
      },
      () => setRecommendedGroupsLoading(false),
    );
  }, [fetchCommunityGroupsForSubject, suggestedSubjectId]);

  useEffect(() => {
    if (selectedOtherSubjectId === "") {
      setSelectedOtherGroups([]);
      setSelectedOtherGroupsError(null);
      setSelectedOtherGroupsLoading(false);
      return;
    }

    fetchCommunityGroupsForSubject(
      selectedOtherSubjectId,
      () => {
        setSelectedOtherGroupsLoading(true);
        setSelectedOtherGroupsError(null);
      },
      (groups) => setSelectedOtherGroups(groups),
      (message) => {
        setSelectedOtherGroups([]);
        setSelectedOtherGroupsError(message);
      },
      () => setSelectedOtherGroupsLoading(false),
    );
  }, [fetchCommunityGroupsForSubject, selectedOtherSubjectId]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-base font-bold text-gray-800">Nhóm cộng đồng</h2>
            <p className="text-xs text-gray-500">
              Theo môn <span className="font-semibold text-blue-500">{suggestedSubjectName}</span>
            </p>
          </div>
        </div>
      </div>

      {recommendedGroupsLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CommunityGroupCardSkeleton />
          <CommunityGroupCardSkeleton />
          <CommunityGroupCardSkeleton />
        </div>
      ) : recommendedGroupsError ? (
        <EmptyState title="Không thể tải nhóm cộng đồng" description={recommendedGroupsError} />
      ) : recommendedGroups.length === 0 ? (
        <EmptyState
          title="Chưa có nhóm phù hợp"
          description="Chưa có nhóm cộng đồng nào phù hợp với môn học của bạn."
          imageUrl="https://app.studystream.live/assets/images/onboarding-slides/result-slide.png"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedGroups.map((group) => (
            <CommunityGroupCard key={group.id} group={group} recommended onJoin={handleOpenJoinModal} onCancel={handleCancelJoinRequest} />
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-gray-100 pt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-sm font-bold text-gray-700">Khám phá thêm</h3>
              <p className="text-xs text-gray-500">Chọn môn học khác để xem nhóm</p>
            </div>
          </div>

          <Autocomplete
            options={otherSubjects}
            getOptionLabel={(option) => option.subjectName}
            value={otherSubjects.find((s) => s.subjectId === selectedOtherSubjectId) || null}
            onChange={(_, newValue) => {
              setSelectedOtherSubjectId(newValue ? newValue.subjectId : "");
            }}
            noOptionsText="Không tìm thấy môn học"
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Tìm môn học..."
                size="small"
                sx={{
                  width: { xs: "100%", sm: 250 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#93c5fd",
                      borderWidth: "1px",
                    },
                  },
                }}
              />
            )}
          />
        </div>

        {subjectsError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Không thể tải danh sách môn học</p>
            <p className="mt-1 text-sm text-red-600">{subjectsError}</p>
          </div>
        )}

        {selectedOtherSubjectId !== "" && selectedOtherGroupsLoading && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CommunityGroupCardSkeleton />
            <CommunityGroupCardSkeleton />
            <CommunityGroupCardSkeleton />
          </div>
        )}

        {selectedOtherSubjectId !== "" && !selectedOtherGroupsLoading && selectedOtherGroupsError && (
          <div className="mt-4">
            <EmptyState title="Không thể tải nhóm cộng đồng" description={selectedOtherGroupsError} />
          </div>
        )}

        {selectedOtherSubjectId !== "" &&
          !selectedOtherGroupsLoading &&
          !selectedOtherGroupsError &&
          selectedOtherGroups.length === 0 && (
            <EmptyState
              title="Chưa có nhóm phù hợp"
              description="Hiện tại chưa có nhóm nào thuộc môn học này."
              imageUrl="https://app.studystream.live/assets/images/onboarding-slides/result-slide.png"
            />
          )}

        {!selectedOtherGroupsLoading && selectedOtherGroups.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedOtherGroups.map((group) => (
              <CommunityGroupCard key={group.id} group={group} onJoin={handleOpenJoinModal} onCancel={handleCancelJoinRequest} />
            ))}
          </div>
        )}
      </div>

      <JoinGroupRequestModal
        open={Boolean(selectedJoinGroup)}
        group={selectedJoinGroup}
        submitting={joiningGroupId === selectedJoinGroup?.id}
        onClose={() => {
          if (joiningGroupId) return;
          setSelectedJoinGroup(null);
        }}
        onSubmit={handleSubmitJoinRequest}
      />
    </section>
  );
}
