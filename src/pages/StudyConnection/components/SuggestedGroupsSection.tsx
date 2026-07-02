import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Autocomplete, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import CommunityGroupCard from "./CommunityGroupCard";
import {
  browseGroups,
  BrowseGroupResponse,
  getAllSubjects,
  joinMemberIntoGroup,
  Subject,
} from "../../../services/GroupService";
import { RootState } from "../../../redux/store";
import { LoadingState, EmptyState } from "./SharedStates";

type CommunityGroupStatus = "ACTIVE" | "INACTIVE";
type CommunityGroupType = "COMMUNITY" | "PRIVATE";

export interface CommunityGroup {
  id: number;
  name: string;
  subjectName: string;
  memberCount: number;
  status: CommunityGroupStatus;
  type: CommunityGroupType;
  createdAt: string;
  isMember: boolean;
}

function mapBrowseGroupToCommunityGroup(item: BrowseGroupResponse): CommunityGroup {
  const normalizedStatus: CommunityGroupStatus =
    item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  return {
    id: item.id,
    name: item.name,
    subjectName: item.subjectName ?? "-",
    memberCount: item.memberCount ?? 0,
    status: normalizedStatus,
    type: "COMMUNITY",
    createdAt: item.createdAt,
    isMember: item.member || false,
  };
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

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      if (joiningGroupId === groupId) return;

      setJoiningGroupId(groupId);

      try {
        const response = await joinMemberIntoGroup(groupId, currentUserId);

        if (!response.success) {
          toast.error(response.message || "Tham gia nhóm thất bại.");
          return;
        }

        toast.success("Tham gia nhóm thành công!");

        setRecommendedGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, isMember: true, memberCount: g.memberCount + 1 }
              : g,
          ),
        );

        setSelectedOtherGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, isMember: true, memberCount: g.memberCount + 1 }
              : g,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setJoiningGroupId((prev) => (prev === groupId ? null : prev));
      }
    },
    [currentUserId, joiningGroupId],
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
        onSuccess(content.map(mapBrowseGroupToCommunityGroup));
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
            <Users size={16} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Nhóm cộng đồng</h2>
            <p className="text-xs text-gray-500">
              Theo môn <span className="font-semibold text-orange-500">{suggestedSubjectName}</span>
            </p>
          </div>
        </div>
      </div>

      {recommendedGroupsLoading ? (
        <LoadingState label="Đang tải nhóm cộng đồng..." />
      ) : recommendedGroupsError ? (
        <EmptyState title="Không thể tải nhóm cộng đồng" description={recommendedGroupsError} />
      ) : recommendedGroups.length === 0 ? (
        <EmptyState
          title="Chưa có nhóm phù hợp"
          description="Chưa có nhóm cộng đồng nào phù hợp với môn học của bạn."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedGroups.map((group) => (
            <CommunityGroupCard key={group.id} group={group} recommended onJoin={handleJoinGroup} />
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-gray-100 pt-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Search size={15} className="text-amber-600" />
            </div>
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
                      borderColor: "#fdba74",
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
          <div className="mt-4">
            <LoadingState label="Đang tải nhóm cộng đồng..." />
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
              title="Chưa có nhóm cộng đồng"
              description="Hiện tại chưa có nhóm nào thuộc môn học này."
            />
          )}

        {!selectedOtherGroupsLoading && selectedOtherGroups.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedOtherGroups.map((group) => (
              <CommunityGroupCard key={group.id} group={group} onJoin={handleJoinGroup} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
