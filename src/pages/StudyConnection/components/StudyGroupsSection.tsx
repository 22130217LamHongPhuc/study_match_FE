import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Check, Clock3, RefreshCw, Users, X } from "lucide-react";
import { useSelector } from "react-redux";

import CommunityGroupCard, { CommunityGroup } from "./CommunityGroupCard";
import SuggestedGroupsSection, { CommunityGroupCardSkeleton } from "./SuggestedGroupsSection";
import { EmptyState, LoadingState } from "./SharedStates";
import {
  acceptGroupInvitation,
  getGroupAvatarUrl,
  getGroupInvitations,
  getGroupsByUserId,
  getSentPendingGroupJoinRequests,
  GroupInvitationResponse,
  rejectGroupInvitation,
  StudyGroupDetailResponse,
} from "../../../services/GroupService";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";

type GroupTabId = "suggested" | "join-requests" | "sent-requests" | "my-groups";

type CountMap = Record<GroupTabId, number>;

const GROUP_TABS: Array<{ id: GroupTabId; label: string }> = [
  { id: "suggested", label: "Gợi ý nhóm học" },
  { id: "join-requests", label: "Yêu cầu tham gia" },
  { id: "sent-requests", label: "Nhóm đã gửi" },
  { id: "my-groups", label: "Nhóm học của tôi" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
};

function mapStudyGroupToCommunityGroup(group: StudyGroupDetailResponse): CommunityGroup {
  return {
    id: group.id,
    name: group.name,
    subjectName: group.subjectName ?? "-",
    memberCount: undefined,
    status: group.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    type: (group.visibility as CommunityGroup["type"]) ?? "STUDY",
    visibility: group.visibility as CommunityGroup["visibility"],
    createdAt: group.createdAt,
    isMember: true,
    avatarUrl: getGroupAvatarUrl(group),
  };
}

function GroupAvatar({ url, name }: { url?: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (n: string) => {
    if (!n) return "";
    return n
      .split(" ")
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (url && !hasError) {
    return (
      <img
        src={url}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-sm uppercase shadow-sm">
      {getInitials(name)}
    </div>
  );
}

function InvitationCard({
  invitation,
  mode,
  actionLoading,
  onAccept,
  onReject,
  onCardClick,
}: {
  invitation: GroupInvitationResponse;
  mode: "received" | "sent";
  actionLoading?: boolean;
  onAccept?: (invitationId: number) => void;
  onReject?: (invitationId: number) => void;
  onCardClick?: () => void;
}) {
  const avatarUrl = getGroupAvatarUrl(invitation);
  const requesterName = invitation.inviterName || `#${invitation.inviterUserId}`;

  return (
    <article
      onClick={onCardClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-md ${onCardClick ? "cursor-pointer hover:border-blue-200" : ""
        }`}
    >
      <div className="flex items-start gap-3">
        <GroupAvatar url={avatarUrl} name={invitation.groupName} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-gray-800">{invitation.groupName}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
              <Clock3 size={12} />
              Chờ duyệt
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {mode === "received"
              ? `${requesterName} đang yêu cầu tham gia`
              : "Bạn đã gửi yêu cầu tham gia"}
            {formatDate(invitation.createdAt) ? ` • ${formatDate(invitation.createdAt)}` : ""}
          </p>

          {invitation.message && (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 line-clamp-2">
              {invitation.message}
            </p>
          )}
        </div>
      </div>

      {mode === "received" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={actionLoading}
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(invitation.invitationId);
            }}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Từ chối
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(invitation.invitationId);
            }}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-500 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Chấp nhận
          </button>
        </div>
      )}
    </article>
  );
}

function JoinRequestDetailModal({
  invitation,
  mode,
  onClose,
  onCancel,
  onAccept,
  onReject,
  actionLoading,
}: {
  invitation: GroupInvitationResponse;
  mode: "received" | "sent";
  onClose: () => void;
  onCancel?: (invitationId: number) => void;
  onAccept?: (invitationId: number) => void;
  onReject?: (invitationId: number) => void;
  actionLoading?: boolean;
}) {
  const avatarUrl = getGroupAvatarUrl(invitation);
  const getInitials = (n: string) => {
    if (!n) return "";
    return n
      .split(" ")
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">Chi tiết yêu cầu tham gia</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={invitation.groupName}
                className="h-14 w-14 rounded-xl border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-base uppercase shadow-sm">
                {getInitials(invitation.groupName)}
              </div>
            )}
            <div>
              <h4 className="font-bold text-gray-900">{invitation.groupName}</h4>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                <Clock3 size={11} />
                Chờ duyệt
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Vai trò:</span>
              <span className="font-semibold text-gray-800">Thành viên xin gia nhập</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Người gửi:</span>
              <span className="font-semibold text-gray-800">
                {invitation.inviterName || `#${invitation.inviterUserId}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày gửi:</span>
              <span className="font-semibold text-gray-800">
                {formatDate(invitation.createdAt)}
              </span>
            </div>
          </div>

          {invitation.message && (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">Lời nhắn:</span>
              <p className="rounded-lg border border-gray-100 p-3 text-sm text-gray-700 bg-gray-50/50">
                {invitation.message}
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-gray-100 px-6 py-4 flex gap-2 justify-end bg-gray-50/50">
          {mode === "sent" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onCancel?.(invitation.invitationId)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy yêu cầu
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onReject?.(invitation.invitationId)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Từ chối
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onAccept?.(invitation.invitationId)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Chấp nhận
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

export function JoinRequestsPanel({ onCountChange }: { onCountChange: (count: number) => void }) {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const currentUserId = profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);

  const [requests, setRequests] = useState<GroupInvitationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<GroupInvitationResponse | null>(null);

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const fetchRequests = useCallback(async () => {
    if (!currentUserId) {
      setRequests([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const groupsResponse = await getGroupsByUserId(currentUserId);
      if (!groupsResponse.success) {
        throw new Error(groupsResponse.message || "Không thể tải danh sách nhóm.");
      }

      const groups = groupsResponse.data ?? [];
      const results = await Promise.allSettled(
        groups.map((group) => getGroupInvitations(group.id)),
      );

      const nextRequests = results
        .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getGroupInvitations>>> => result.status === "fulfilled")
        .flatMap((result) => result.value.data ?? [])
        .filter(
          (invitation) =>
            invitation.status === "PENDING" &&
            invitation.inviterUserId === invitation.inviteeUserId,
        );

      setRequests(nextRequests);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setRequests([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchRequests();
    const handleUpdated = () => {
      fetchRequests();
    };
    window.addEventListener("group_invitations_updated", handleUpdated);
    return () => {
      window.removeEventListener("group_invitations_updated", handleUpdated);
    };
  }, [fetchRequests]);

  const requestCount = requests.length;
  useEffect(() => {
    onCountChangeRef.current(requestCount);
  }, [requestCount]);

  const handleAction = useCallback(
    async (invitationId: number, action: "accept" | "reject") => {
      if (actionLoadingId) return;
      setActionLoadingId(invitationId);
      setError(null);

      try {
        if (action === "accept") {
          await acceptGroupInvitation(invitationId);
        } else {
          await rejectGroupInvitation(invitationId);
        }

        setRequests((prev) => {
          const next = prev.filter((item) => item.invitationId !== invitationId);
          onCountChange(next.length);
          return next;
        });
        setSelectedInvitation(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể cập nhật yêu cầu.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [actionLoadingId, onCountChange],
  );

  if (loading) return <LoadingState label="Đang tải yêu cầu tham gia..." />;

  return (
    <>
      <SectionShell
        title="Yêu cầu tham gia"
        onRefresh={fetchRequests}
        error={error}
      >
        {requests.length === 0 ? (
          <EmptyState
            title="Chưa có yêu cầu tham gia"
            description="Các yêu cầu xin vào nhóm bạn quản lý sẽ hiển thị tại đây."
            actionLabel="Tải lại"
            onAction={fetchRequests}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                mode="received"
                actionLoading={actionLoadingId === invitation.invitationId}
                onAccept={(id) => handleAction(id, "accept")}
                onReject={(id) => handleAction(id, "reject")}
                onCardClick={() => setSelectedInvitation(invitation)}
              />
            ))}
          </div>
        )}
      </SectionShell>

      {selectedInvitation && (
        <JoinRequestDetailModal
          invitation={selectedInvitation}
          mode="received"
          actionLoading={actionLoadingId === selectedInvitation.invitationId}
          onClose={() => setSelectedInvitation(null)}
          onAccept={(id) => handleAction(id, "accept")}
          onReject={(id) => handleAction(id, "reject")}
        />
      )}
    </>
  );
}

export function SentRequestsPanel({ onCountChange }: { onCountChange: (count: number) => void }) {
  const [requests, setRequests] = useState<GroupInvitationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<GroupInvitationResponse | null>(null);

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getSentPendingGroupJoinRequests();
      if (!response.success) {
        throw new Error(response.message || "Không thể tải nhóm đã gửi yêu cầu.");
      }

      const nextRequests = response.data ?? [];
      setRequests(nextRequests);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setRequests([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const handleUpdated = () => {
      fetchRequests();
    };
    window.addEventListener("group_invitations_updated", handleUpdated);
    return () => {
      window.removeEventListener("group_invitations_updated", handleUpdated);
    };
  }, [fetchRequests]);

  const requestCount = requests.length;
  useEffect(() => {
    onCountChangeRef.current(requestCount);
  }, [requestCount]);

  const handleCancelRequest = useCallback(
    async (invitationId: number) => {
      if (actionLoadingId) return;
      setActionLoadingId(invitationId);
      setError(null);

      try {
        await rejectGroupInvitation(invitationId);
        setRequests((prev) => {
          const next = prev.filter((item) => item.invitationId !== invitationId);
          onCountChange(next.length);
          return next;
        });
        setSelectedInvitation(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể hủy yêu cầu.");
        toast.error("Hủy yêu cầu thất bại.");
      } finally {
        setActionLoadingId(null);
      }
    },
    [actionLoadingId, onCountChange],
  );

  if (loading) return <LoadingState label="Đang tải nhóm đã gửi..." />;

  return (
    <>
      <SectionShell
        title="Nhóm đã gửi"
        onRefresh={fetchRequests}
        error={error}
      >
        {requests.length === 0 ? (
          <EmptyState
            title="Chưa gửi yêu cầu tham gia nhóm"
            description="Những nhóm bạn đã gửi yêu cầu nhưng chưa được duyệt sẽ nằm ở đây."
            actionLabel="Tải lại"
            onAction={fetchRequests}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                mode="sent"
                onCardClick={() => setSelectedInvitation(invitation)}
              />
            ))}
          </div>
        )}
      </SectionShell>

      {selectedInvitation && (
        <JoinRequestDetailModal
          invitation={selectedInvitation}
          mode="sent"
          actionLoading={actionLoadingId === selectedInvitation.invitationId}
          onClose={() => setSelectedInvitation(null)}
          onCancel={handleCancelRequest}
        />
      )}
    </>
  );
}

function MyGroupsPanel({ onCountChange }: { onCountChange: (count: number) => void }) {
  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const currentUserId = profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  const fetchGroups = useCallback(async () => {
    if (!currentUserId) {
      setGroups([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getGroupsByUserId(currentUserId);
      if (!response.success) {
        throw new Error(response.message || "Không thể tải nhóm học của tôi.");
      }

      const nextGroups = (response.data ?? []).map(mapStudyGroupToCommunityGroup);
      setGroups(nextGroups);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setGroups([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const groupsCount = groups.length;
  useEffect(() => {
    onCountChangeRef.current(groupsCount);
  }, [groupsCount]);

  if (loading) {
    return (
      <SectionShell title="Nhóm học của tôi" subtitle="Đang tải nhóm đã tham gia...">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CommunityGroupCardSkeleton />
          <CommunityGroupCardSkeleton />
          <CommunityGroupCardSkeleton />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      title="Nhóm học của tôi"
      subtitle={`${groups.length} nhóm đã tham gia`}
      onRefresh={fetchGroups}
      error={error}
    >
      {groups.length === 0 ? (
        <EmptyState
          title="Bạn chưa tham gia nhóm học nào"
          description="Khi được duyệt vào nhóm hoặc tự tạo nhóm, nhóm sẽ hiển thị tại đây."
          actionLabel="Tải lại"
          onAction={fetchGroups}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <CommunityGroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function SectionShell({
  title,
  subtitle,
  onRefresh,
  error,
  children,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

      </div>

      {children}
    </section>
  );
}

export default function StudyGroupsSection() {
  const [activeTab, setActiveTab] = useState<GroupTabId>("suggested");
  const [counts, setCounts] = useState<CountMap>({
    suggested: 0,
    "join-requests": 0,
    "sent-requests": 0,
    "my-groups": 0,
  });

  const updateCount = useCallback((tabId: GroupTabId, count: number) => {
    setCounts((prev) => (prev[tabId] === count ? prev : { ...prev, [tabId]: count }));
  }, []);

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "join-requests":
        return <JoinRequestsPanel onCountChange={(count) => updateCount("join-requests", count)} />;
      case "sent-requests":
        return <SentRequestsPanel onCountChange={(count) => updateCount("sent-requests", count)} />;
      case "my-groups":
        return <MyGroupsPanel onCountChange={(count) => updateCount("my-groups", count)} />;
      case "suggested":
      default:
        return <SuggestedGroupsSection />;
    }
  }, [activeTab, updateCount]);

  return (
    <div className="space-y-5">
      <div className="flex">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {GROUP_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-all ${isActive
                  ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-transparent bg-transparent text-gray-500 hover:text-blue-600"
                  }`}
              >
                {tab.label}
                {tab.id !== "suggested" && (
                  <span className={`ml-1.5 text-xs ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeContent}
    </div>
  );
}
