import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCw, GraduationCap, Users, Search } from "lucide-react";
import RecommendationCard from "./components/RecommendationCard";
import CommunityGroupCard from "./components/CommunityGroupCard";
import { useRecommendations } from "./hooks/useRecommendations";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FriendRequestVm, RecommendationCardVm } from "./types";
import { matchingItemApi } from "../../services/matchingItemApi";
import {
  browseGroups,
  BrowseGroupResponse,
  getAllSubjects,
  joinMemberIntoGroup,
  Subject,
} from "../../services/GroupService";
import {
  requestFriendService,
  updateFriendRequestStatusService,
} from "../../services/FriendService";

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

function isSuccessCode(code: number | string | undefined) {
  const responseCode = Number(code);
  return responseCode >= 200 && responseCode < 300;
}

export default function RecommendationPage() {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const navigate = useNavigate();

  const userId = Number(localStorage.getItem("userId") ?? 0);

  const { loading, error, items, fetchRecommendations } =
    useRecommendations(userId);

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
  const [acceptingRequestId, setAcceptingRequestId] = useState<number | null>(
    null,
  );

  const handleViewProfile = useCallback(
    (recommendation: RecommendationCardVm) => {
      navigate(`/profile/${recommendation.userId}`, {
        state: {
          fromRecommendation: true,
          finalScore: recommendation.finalScore,
          reasonText: recommendation.reasonText,
        },
      });
    },
    [navigate],
  );

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

        if (isSuccessCode(response.code)) {
          try {
            await matchingItemApi.updateStatus({
              userId: currentUserId,
              recommendedUserId: targetUserId,
              actionStatus: "FRIEND_REQUEST_SENT",
              finalScore: items.find((item) => item.userId === targetUserId)?.finalScore,
            });
          } catch (error) {
            console.error("Track matching FRIEND_REQUEST_SENT failed", error);
          }

          toast.success("Đã gửi lời mời kết bạn.");
          await fetchRecommendations(userId);
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
    [connectingUserId, fetchRecommendations, profileVm?.userId, userId],
  );

  const handleAcceptFriendRequest = useCallback(
    async (request: FriendRequestVm) => {
      const currentUserId =
        profileVm?.userId ?? Number(localStorage.getItem("userId"));
      const requestId = request.id;
      const senderId = request.senderId;

      if (!currentUserId || !senderId) return;
      if (currentUserId === senderId) return;
      if (acceptingRequestId === requestId) return;

      setAcceptingRequestId(requestId);

      try {
        const response = await updateFriendRequestStatusService(
          requestId,
          "APPROVED",
        );

        if (isSuccessCode(response.code)) {
          try {
            await matchingItemApi.updateStatus({
              userId: currentUserId,
              recommendedUserId: senderId,
              actionStatus: "ACCEPTED",
              finalScore: items.find((item) => item.userId === senderId)?.finalScore,
            });
          } catch (error) {
            console.error("Track matching ACCEPTED failed", error);
          }

          toast.success("Đã chấp nhận lời mời kết bạn.");
          await fetchRecommendations(userId);
          return;
        }

        toast.error(response.message || "Chấp nhận lời mời thất bại.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        toast.error(message);
      } finally {
        setAcceptingRequestId((prev) => (prev === requestId ? null : prev));
      }
    },
    [acceptingRequestId, fetchRecommendations, profileVm?.userId, userId],
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
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">

        <section className="rounded-xl bg-white p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Gợi ý học tập
              </h1>
              <p className="text-sm text-gray-500">
                Tìm bạn học và nhóm phù hợp với bạn
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Không thể tải danh sách bạn học
                </p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => fetchRecommendations(userId)}
                className="h-9 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        <section className="rounded-xl bg-white p-5 border border-gray-200">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <Users size={16} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Bạn học phù hợp
                </h2>
                <p className="text-xs text-gray-500">
                  {items.length} bạn học được gợi ý
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchRecommendations(userId)}
              disabled={loading}
              className="inline-flex items-center gap-2 h-9 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 sm:mt-0"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>

          {loading ? (
            <LoadingState label="Đang tìm bạn học phù hợp..." />
          ) : items.length === 0 ? (
            <EmptyState
              title="Chưa có bạn học phù hợp"
              description="Hệ thống chưa tìm thấy bạn học phù hợp với bạn."
              actionLabel="Tải lại"
              onAction={() => fetchRecommendations(userId)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <RecommendationCard
                  key={item.userId}
                  recommendation={item}
                  onViewProfile={handleViewProfile}
                  onConnect={handleConnect}
                  onAccept={handleAcceptFriendRequest}
                  isConnecting={connectingUserId === item.userId}
                  isAccepting={acceptingRequestId === item.friendRequest?.id}
                  currentUserId={
                    profileVm?.userId ?? Number(localStorage.getItem("userId"))
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 border border-gray-200">
          <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <Users size={16} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Nhóm cộng đồng
                </h2>
                <p className="text-xs text-gray-500">
                  Theo môn{" "}
                  <span className="font-semibold text-orange-500">
                    {suggestedSubjectName}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {recommendedGroupsLoading ? (
            <LoadingState label="Đang tải nhóm cộng đồng..." />
          ) : recommendedGroupsError ? (
            <EmptyState
              title="Không thể tải nhóm cộng đồng"
              description={recommendedGroupsError}
            />
          ) : recommendedGroups.length === 0 ? (
            <EmptyState
              title="Chưa có nhóm phù hợp"
              description="Chưa có nhóm cộng đồng nào phù hợp với môn học của bạn."
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

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Search size={15} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700">
                    Khám phá thêm
                  </h3>
                  <p className="text-xs text-gray-500">
                    Chọn môn học khác để xem nhóm
                  </p>
                </div>
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
                className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100 transition-all"
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
                <LoadingState label="Đang tải nhóm cộng đồng..." />
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
                  description="Hiện tại chưa có nhóm nào thuộc môn học này."
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
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
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
    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 text-center">
      <div>
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <BookOpen size={20} className="text-orange-400" />
        </div>

        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>

        <p className="mt-1 max-w-sm text-sm text-gray-500">
          {description}
        </p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 h-9 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
