import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck } from "lucide-react";
import RecommendationCard from "./components/RecommendationCard";
import CommunityGroupCard from "./components/CommunityGroupCard";
import { useRecommendations } from "./hooks/useRecommendations";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "sonner";
import {
  browseGroups,
  BrowseGroupResponse,
  getAllSubjects,
  joinMemberIntoGroup,
  Subject,
} from "../../services/GroupService";
import { requestFriendService } from "../../services/FriendService";

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
}

function mapBrowseGroupToCommunityGroup(
  item: BrowseGroupResponse,
): CommunityGroup {
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
  };
}

export default function RecommendationPage() {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);

  const { userId, loading, error, items, fetchRecommendations } =
    useRecommendations(profileVm?.userId || 28);

  const suggestedSubjectId = profileVm?.mainSubjectId ?? 0;
  const suggestedSubjectName = profileVm?.mainSubjectName ?? "-";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const [recommendedGroups, setRecommendedGroups] = useState<CommunityGroup[]>(
    [],
  );
  const [recommendedGroupsLoading, setRecommendedGroupsLoading] =
    useState(false);
  const [recommendedGroupsError, setRecommendedGroupsError] = useState<
    string | null
  >(null);

  const [selectedOtherSubjectId, setSelectedOtherSubjectId] = useState<
    number | ""
  >("");
  const [selectedOtherGroups, setSelectedOtherGroups] = useState<
    CommunityGroup[]
  >([]);
  const [selectedOtherGroupsLoading, setSelectedOtherGroupsLoading] =
    useState(false);
  const [selectedOtherGroupsError, setSelectedOtherGroupsError] = useState<
    string | null
  >(null);

  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      const currentUserId = profileVm?.userId;
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
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setJoiningGroupId((prev) => (prev === groupId ? null : prev));
      }
    },
    [joiningGroupId, profileVm?.userId],
  );

  const handleConnect = useCallback(
    async (targetUserId: number) => {
      const currentUserId =
        profileVm?.userId ?? Number(localStorage.getItem("userId"));

      if (!currentUserId) {
        toast.error("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      if (currentUserId === targetUserId) {
        toast.error("Bạn không thể gửi lời mời cho chính mình.");
        return;
      }

      if (connectingUserId === targetUserId) return;

      setConnectingUserId(targetUserId);

      try {
        const response = await requestFriendService(targetUserId);
        const responseCode = Number(response.code);

        if (responseCode >= 200 && responseCode < 300) {
          toast.success("Đã gửi lời mời kết bạn.");
          return;
        }

        toast.error(response.message || "Gửi lời mời kết bạn thất bại.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setConnectingUserId((prev) => (prev === targetUserId ? null : prev));
      }
    },
    [connectingUserId, profileVm?.userId],
  );

  const otherSubjects = useMemo(() => {
    if (subjects.length === 0) return [];
    return subjects.filter(
      (subject) => subject.subjectId !== suggestedSubjectId,
    );
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
      const errorMessage =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
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
        const errorMessage =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
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
    <main className="min-h-full bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-gray-900">Gợi ý học tập</h1>

          <p className="mt-1 text-sm text-gray-500">
            Danh sách bạn học và nhóm cộng đồng phù hợp với hồ sơ học tập của
            bạn.
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">
                  Không thể tải danh sách bạn học
                </p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => fetchRecommendations(userId)}
                className="h-9 rounded-md border border-red-300 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Bạn học phù hợp
              </h2>

              <p className="text-sm text-gray-500">
                Tìm thấy {items.length} bạn học phù hợp.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchRecommendations(userId)}
              disabled={loading}
              className="mt-2 h-9 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0"
            >
              {loading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>

          {loading ? (
            <LoadingState label="Đang tải danh sách bạn học..." />
          ) : items.length === 0 ? (
            <EmptyState
              title="Chưa có bạn học phù hợp"
              description="Hiện tại hệ thống chưa tìm thấy bạn học phù hợp với hồ sơ của bạn."
              actionLabel="Tải lại"
              onAction={() => fetchRecommendations(userId)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <RecommendationCard
                  key={item.userId}
                  recommendation={item}
                  onConnect={handleConnect}
                  isConnecting={connectingUserId === item.userId}
                  currentUserId={
                    profileVm?.userId ?? Number(localStorage.getItem("userId"))
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Nhóm cộng đồng phù hợp
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Nhóm được đề xuất theo môn học hiện tại của bạn:{" "}
                <span className="font-medium text-gray-800">
                  {suggestedSubjectName}
                </span>
              </p>
            </div>
          </div>

          {recommendedGroupsLoading ? (
            <LoadingState label="Đang tải danh sách nhóm cộng đồng..." />
          ) : recommendedGroupsError ? (
            <EmptyState
              title="Không thể tải nhóm cộng đồng"
              description={recommendedGroupsError}
            />
          ) : recommendedGroups.length === 0 ? (
            <EmptyState
              title="Chưa có nhóm cộng đồng phù hợp"
              description="Hiện tại chưa có nhóm cộng đồng phù hợp với môn học hiện tại của bạn."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedGroups.map((group) => (
                <CommunityGroupCard
                  key={group.id}
                  group={group}
                  recommended
                  onJoin={handleJoinGroup}
                />
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Muốn tham gia nhóm cộng đồng khác?
                </h3>

                <p className="text-sm text-gray-500">
                  Bạn có thể chọn môn học khác để xem nhóm cộng đồng tương ứng.
                </p>
              </div>

              <select
                value={selectedOtherSubjectId}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) {
                    setSelectedOtherSubjectId("");
                    return;
                  }

                  const parsed = Number(value);
                  setSelectedOtherSubjectId(
                    Number.isFinite(parsed) ? parsed : "",
                  );
                }}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-500"
              >
                <option value="">Chọn môn học</option>
                {otherSubjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            {subjectsError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Không thể tải danh sách môn học
                </p>
                <p className="mt-1 text-sm text-red-600">{subjectsError}</p>
              </div>
            )}

            {selectedOtherSubjectId !== "" && selectedOtherGroupsLoading && (
              <div className="mt-4">
                <LoadingState label="Đang tải danh sách nhóm cộng đồng..." />
              </div>
            )}

            {selectedOtherSubjectId !== "" &&
              !selectedOtherGroupsLoading &&
              selectedOtherGroupsError && (
                <div className="mt-4">
                  <EmptyState
                    title="Không thể tải nhóm cộng đồng"
                    description={selectedOtherGroupsError}
                  />
                </div>
              )}

            {selectedOtherSubjectId !== "" &&
              !selectedOtherGroupsLoading &&
              !selectedOtherGroupsError &&
              selectedOtherGroups.length === 0 && (
                <EmptyState
                  title="Chưa có nhóm cộng đồng"
                  description="Hiện tại chưa có nhóm cộng đồng nào thuộc môn học này."
                />
              )}

            {!selectedOtherGroupsLoading && selectedOtherGroups.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedOtherGroups.map((group) => (
                  <CommunityGroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500">
          <BookOpenCheck size={22} />
        </div>

        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

        <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
          {description}
        </p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 h-9 rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
