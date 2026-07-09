import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Search, Users, GraduationCap, UserPlus, MessageCircle, UserMinus, Clock, ChevronDown, Check } from "lucide-react";

import { RootState } from "../../redux/store";
import { searchStudents, StudentSearchItem } from "../../services/UserService";
import { browseGroups, requestJoinGroup, BrowseGroupResponse, getGroupsByUserId } from "../../services/GroupService";
import { requestFriendService, loadFriendRequestsService, normalizeAvatarUrl } from "../../services/FriendService";
import { BASE_USER_SERVICE } from "../../config/BaseConfig";

import CommunityGroupCard, { CommunityGroup } from "../StudyConnection/components/CommunityGroupCard";
import JoinGroupRequestModal from "../StudyConnection/components/JoinGroupRequestModal";
import { EmptyState } from "../StudyConnection/components/SharedStates";
import { CommunityGroupCardSkeleton } from "../StudyConnection/components/SuggestedGroupsSection";

interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

const STUDENT_SORT_OPTIONS: SortOption[] = [
  { value: "default",           label: "Tất cả" },
  { value: "az",                label: "Từ A → Z" },
  { value: "za",                label: "Từ Z → A" },
  { value: "mutual_desc",       label: "Bạn chung" },
  { value: "common_group_desc", label: "Nhóm chung" },
];

const GROUP_SORT_OPTIONS: SortOption[] = [
  { value: "default",      label: "Tất cả" },
  { value: "az",           label: "Từ A → Z" },
  { value: "za",           label: "Từ Z → A" },
  { value: "member_desc",  label: "Nhiều thành viên nhất" },
  { value: "friend_desc",  label: "Nhiều bạn chung nhất" },
];

function SortDropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: SortOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-lg border text-xs font-medium transition-all ${
          open
            ? "border-orange-400 bg-orange-50 text-orange-600 ring-2 ring-orange-100"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <span className="whitespace-nowrap">{selected.label}</span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-orange-500" : "text-gray-400"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[11rem] rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors ${
                opt.value === value
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={13} className="text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type FriendStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIEND";

interface StudentCard {
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  friendStatus: FriendStatus;
  friendRequestId?: number;
  mutualCount: number | null;
  commonGroupCount: number | null;
}

function mapBrowseGroupToCommunityGroup(item: BrowseGroupResponse): CommunityGroup {
  return {
    id: item.id,
    name: item.name,
    subjectName: item.subjectName ?? "-",
    memberCount: item.memberCount ?? 0,
    status: item.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    visibility: (item.visibility as any) || "COMMUNITY",
    createdAt: item.createdAt,
    isMember: item.member || false,
    isJoinRequestPending: item.joinRequestPending || false,
  };
}

function isJoinRequestPendingConflict(message?: string): boolean {
  return Boolean(message?.toLowerCase().includes("already pending"));
}

async function fetchMutualCount(currentUserId: number, targetUserId: number): Promise<number> {
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(
      `${BASE_USER_SERVICE}/api/users/friends/${currentUserId}/mutual?targetUserId=${targetUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data?.mutualFriend ?? data?.mutualFriends ?? 0);
  } catch {
    return 0;
  }
}


const AVATAR_COLORS = [
  "from-orange-400 to-orange-600",
  "from-violet-400 to-violet-600",
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
];

function getAvatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function AvatarCircle({ userId, name, avatarUrl, size = 48 }: { userId: number; name: string; avatarUrl: string | null; size?: number }) {
  const src = normalizeAvatarUrl(avatarUrl);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = getAvatarColor(userId);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = "none";
          el.nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex-shrink-0 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-base`}
    >
      {initials}
    </div>
  );
}


interface StudentCardProps {
  student: StudentCard;
  currentUserId: number;
  onViewProfile: (userId: number) => void;
  onConnect: (userId: number) => void;
  onMessage: (userId: number) => void;
  isConnecting: boolean;
}

function StudentCardComponent({ student, currentUserId, onViewProfile, onConnect, onMessage, isConnecting }: StudentCardProps) {
  const isSelf = student.userId === currentUserId;

  const mutualBadge = () => {
    if (student.mutualCount === null) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="inline-block h-3 w-16 animate-pulse rounded bg-gray-200" />
        </span>
      );
    }
    if (student.mutualCount === 0) {
      return <span className="text-xs text-gray-400">Không có bạn chung</span>;
    }
    return (
      <span className="text-xs font-medium text-gray-500">
        {student.mutualCount} bạn chung
      </span>
    );
  };

  const actionButtons = () => {
    if (isSelf) return null;

    if (student.friendStatus === "FRIEND") {
      return (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <UserMinus size={13} />
            Hủy kết bạn
          </button>
          <button
            onClick={() => onMessage(student.userId)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={13} />
            Nhắn tin
          </button>
        </div>
      );
    }

    if (student.friendStatus === "PENDING_SENT") {
      return (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            disabled
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-medium text-orange-500 cursor-default"
          >
            <Clock size={13} />
            Đã gửi lời mời
          </button>
          <button
            onClick={() => onMessage(student.userId)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={13} />
            Nhắn tin
          </button>
        </div>
      );
    }

    if (student.friendStatus === "PENDING_RECEIVED") {
      return (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            disabled
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 py-2 text-xs font-medium text-blue-500 cursor-default"
          >
            <Clock size={13} />
            Chờ bạn phản hồi
          </button>
          <button
            onClick={() => onMessage(student.userId)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={13} />
            Nhắn tin
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onViewProfile(student.userId)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Xem hồ sơ
        </button>
        <button
          onClick={() => onConnect(student.userId)}
          disabled={isConnecting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isConnecting ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <UserPlus size={13} />
          )}
          Kết bạn
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onViewProfile(student.userId)}
      >
        <AvatarCircle
          userId={student.userId}
          name={student.fullName || student.email}
          avatarUrl={student.avatarUrl}
          size={48}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-800 text-sm hover:text-orange-600 transition-colors">
            {student.fullName || "Không rõ tên"}
          </p>
          <div className="mt-0.5">{mutualBadge()}</div>
        </div>
      </div>

      {actionButtons()}
    </div>
  );
}


function StudentCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-gray-200" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <div className="flex-1 h-8 rounded-lg bg-gray-100" />
        <div className="flex-1 h-8 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}


export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query")?.trim() || "";

  const profileVm = useSelector((state: RootState) => state.profile.profileVm);
  const currentUserId = profileVm?.userId ?? Number(localStorage.getItem("userId") ?? 0);

  const [activeTab, setActiveTab] = useState<"classmates" | "groups">("classmates");
  const [localQuery, setLocalQuery] = useState(query);
  const [sortOrder, setSortOrder]      = useState("default");
  const [groupSortOrder, setGroupSortOrder] = useState("default");

  const [students, setStudents] = useState<StudentCard[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [selectedJoinGroup, setSelectedJoinGroup] = useState<CommunityGroup | null>(null);
  const [groupFriendCountMap, setGroupFriendCountMap] = useState<Record<number, number>>({});

  useEffect(() => { setLocalQuery(query); }, [query]);

  const buildFriendStatusMap = useCallback(async () => {
    try {
      const requests = await loadFriendRequestsService(currentUserId);
      const sentMap: Record<number, { id: number; status: string }> = {};
      const receivedMap: Record<number, { id: number; status: string }> = {};
      requests.sent.forEach((r) => { sentMap[r.receiverId] = { id: r.id, status: r.status }; });
      requests.received.forEach((r) => { receivedMap[r.senderId] = { id: r.id, status: r.status }; });
      return { sentMap, receivedMap };
    } catch {
      return { sentMap: {}, receivedMap: {} };
    }
  }, [currentUserId]);

  const resolveFriendStatus = (
    userId: number,
    sentMap: Record<number, { id: number; status: string }>,
    receivedMap: Record<number, { id: number; status: string }>,
  ): { friendStatus: FriendStatus; friendRequestId?: number } => {
    if (sentMap[userId]) {
      const s = sentMap[userId].status;
      if (s === "APPROVED") return { friendStatus: "FRIEND", friendRequestId: sentMap[userId].id };
      if (s === "PENDING") return { friendStatus: "PENDING_SENT", friendRequestId: sentMap[userId].id };
    }
    if (receivedMap[userId]) {
      const s = receivedMap[userId].status;
      if (s === "APPROVED") return { friendStatus: "FRIEND", friendRequestId: receivedMap[userId].id };
      if (s === "PENDING") return { friendStatus: "PENDING_RECEIVED", friendRequestId: receivedMap[userId].id };
    }
    return { friendStatus: "NONE" };
  };

  const loadCommonGroupCounts = useCallback(
    async (cards: StudentCard[], myGroupIds: Set<number>) => {
      if (!currentUserId || myGroupIds.size === 0) {
        setStudents((prev) => prev.map((s) => ({ ...s, commonGroupCount: 0 })));
        return;
      }
      const BATCH = 10;
      for (let i = 0; i < cards.length; i += BATCH) {
        const batch = cards.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(async (c) => {
            try {
              const res = await getGroupsByUserId(c.userId);
              const theirIds = new Set((res.data ?? []).map((g) => g.id));
              let count = 0;
              myGroupIds.forEach((id) => { if (theirIds.has(id)) count++; });
              return count;
            } catch {
              return 0;
            }
          }),
        );
        setStudents((prev) =>
          prev.map((s) => {
            const idx = batch.findIndex((b) => b.userId === s.userId);
            if (idx === -1) return s;
            return { ...s, commonGroupCount: results[idx] };
          }),
        );
      }
    },
    [currentUserId],
  );

  const loadMutualCounts = useCallback(
    async (cards: StudentCard[]) => {
      if (!currentUserId) return;
      const BATCH = 20;
      for (let i = 0; i < cards.length; i += BATCH) {
        const batch = cards.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map((c) => fetchMutualCount(currentUserId, c.userId)),
        );
        setStudents((prev) =>
          prev.map((s) => {
            const idx = batch.findIndex((b) => b.userId === s.userId);
            if (idx === -1) return s;
            return { ...s, mutualCount: results[idx] };
          }),
        );
      }
    },
    [currentUserId],
  );

  const fetchStudents = useCallback(
    async (keyword: string) => {
      if (!currentUserId) return;
      setLoadingStudents(true);
      try {
        const [response, { sentMap, receivedMap }] = await Promise.all([
          searchStudents(keyword, 0, 100),
          buildFriendStatusMap(),
        ]);

        if (response.success) {
          const content: StudentSearchItem[] = response.data?.content ?? [];
          const cards: StudentCard[] = content
            .filter((u) => u.user_id !== currentUserId)
            .map((u) => {
              const { friendStatus, friendRequestId } = resolveFriendStatus(u.user_id, sentMap, receivedMap);
              return {
                userId: u.user_id,
                fullName: u.full_name ?? "",
                email: u.email,
                avatarUrl: u.avatar_url,
                bio: u.bio,
                friendStatus,
                friendRequestId,
                mutualCount: null,
                commonGroupCount: null,
              };
            });
          setStudents(cards);
          loadMutualCounts(cards);
          const myGroupsRes = await getGroupsByUserId(currentUserId).catch(() => ({ data: [] as any }));
          const myGroupIds = new Set<number>((myGroupsRes.data ?? []).map((g: any) => g.id as number));
          loadCommonGroupCounts(cards, myGroupIds);
        }
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoadingStudents(false);
      }
    },
    [currentUserId, buildFriendStatusMap, loadMutualCounts, loadCommonGroupCounts],
  );

  const loadGroupFriendCounts = useCallback(async (groupList: CommunityGroup[]) => {
    try {
      const { sentMap, receivedMap } = await buildFriendStatusMap();
      const friendIds = new Set<number>([
        ...Object.keys(sentMap).map(Number).filter(id => sentMap[id].status === "APPROVED"),
        ...Object.keys(receivedMap).map(Number).filter(id => receivedMap[id].status === "APPROVED"),
      ]);
      if (friendIds.size === 0) return;

      const BATCH = 10;
      for (let i = 0; i < groupList.length; i += BATCH) {
        const batch = groupList.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(async (g) => {
            try {
              const { getActiveGroupMemberIds } = await import("../../services/GroupService");
              const res = await getActiveGroupMemberIds(g.id);
              const memberIds: number[] = res.data ?? [];
              return memberIds.filter((id) => friendIds.has(id)).length;
            } catch { return 0; }
          }),
        );
        setGroupFriendCountMap((prev) => {
          const next = { ...prev };
          batch.forEach((g, idx) => { next[g.id] = results[idx]; });
          return next;
        });
      }
    } catch {}
  }, [buildFriendStatusMap]);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const response = await browseGroups(undefined, undefined, 0, 100);
      if (response.success) {
        const content = response.data?.content ?? [];
        const mapped = content.map(mapBrowseGroupToCommunityGroup);
        setGroups(mapped);
        loadGroupFriendCounts(mapped);
      }
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  }, [loadGroupFriendCounts]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);
  useEffect(() => { fetchStudents(query); }, [fetchStudents, query]);

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(localQuery.trim())}`);
  };

  const sortedStudents = useMemo(() => {
    const arr = [...students];
    switch (sortOrder) {
      case "az":
        return arr.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "", "vi"));
      case "za":
        return arr.sort((a, b) => (b.fullName || "").localeCompare(a.fullName || "", "vi"));
      case "mutual_desc":
        return arr.sort((a, b) => (b.mutualCount ?? 0) - (a.mutualCount ?? 0));
      case "common_group_desc":
        return arr.sort((a, b) => (b.commonGroupCount ?? 0) - (a.commonGroupCount ?? 0));
      default:
        return arr;
    }
  }, [students, sortOrder]);

  const sortedGroups = useMemo(() => {
    const pub = groups.filter((g) => g.visibility !== "PRIVATE");
    const filtered = query
      ? pub.filter((g) => g.name?.toLowerCase().includes(query.toLowerCase()) || g.subjectName?.toLowerCase().includes(query.toLowerCase()))
      : pub;
    const arr = [...filtered];
    switch (groupSortOrder) {
      case "az":          return arr.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
      case "za":          return arr.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi"));
      case "member_desc": return arr.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0));
      case "friend_desc": return arr.sort((a, b) => (groupFriendCountMap[b.id] ?? 0) - (groupFriendCountMap[a.id] ?? 0));
      default:            return arr;
    }
  }, [groups, query, groupSortOrder, groupFriendCountMap]);

  const handleConnect = useCallback(
    async (targetUserId: number) => {
      if (!currentUserId) { toast.error("Vui lòng đăng nhập lại."); return; }
      if (connectingUserId === targetUserId) return;
      setConnectingUserId(targetUserId);
      try {
        const response = await requestFriendService(targetUserId);
        const codeNum = Number(response.code);
        const ok = codeNum >= 200 && codeNum < 300;
        if (!ok) { toast.error(response.message || "Gửi lời mời thất bại."); return; }
        toast.success("Đã gửi lời mời kết bạn!");
        setStudents((prev) =>
          prev.map((s) => s.userId === targetUserId ? { ...s, friendStatus: "PENDING_SENT" as FriendStatus } : s),
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      } finally {
        setConnectingUserId(null);
      }
    },
    [connectingUserId, currentUserId],
  );

  const handleMessage = useCallback(
    (targetUserId: number) => navigate(`/conversation?userId=${targetUserId}`),
    [navigate],
  );

  const handleViewProfile = useCallback((userId: number) => navigate(`/profile/${userId}`), [navigate]);

  const handleOpenJoinModal = useCallback(
    (groupId: number) => {
      setSelectedJoinGroup(groups.find((group) => group.id === groupId) || null);
    },
    [groups],
  );

  const handleSubmitJoinRequest = useCallback(
    async (message: string) => {
      if (!selectedJoinGroup) return;
      if (!currentUserId) {
        toast.error("Vui lòng đăng nhập lại.");
        return;
      }

      const groupId = selectedJoinGroup.id;
      if (joiningGroupId === groupId) return;

      setJoiningGroupId(groupId);
      try {
        const response = await requestJoinGroup(groupId, currentUserId, message);
        if (!response.success) {
          if (isJoinRequestPendingConflict(response.message)) {
            setGroups((prev) =>
              prev.map((group) =>
                group.id === groupId ? { ...group, isJoinRequestPending: true } : group,
              ),
            );
            setSelectedJoinGroup(null);
            return;
          }

          toast.error(response.message || "Gửi yêu cầu tham gia nhóm thất bại.");
          return;
        }

        setGroups((prev) =>
          prev.map((group) =>
            group.id === groupId ? { ...group, isJoinRequestPending: true } : group,
          ),
        );
        setSelectedJoinGroup(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
        if (isJoinRequestPendingConflict(errorMessage)) {
          setGroups((prev) =>
            prev.map((group) =>
              group.id === groupId ? { ...group, isJoinRequestPending: true } : group,
            ),
          );
          setSelectedJoinGroup(null);
          return;
        }

        toast.error(errorMessage);
      } finally {
        setJoiningGroupId(null);
      }
    },
    [currentUserId, joiningGroupId, selectedJoinGroup],
  );


  return (
    <main className="min-h-full bg-orange-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Kết quả tìm kiếm</h1>
              {query && (
                <p className="text-sm text-gray-500 mt-1">
                  Tìm thấy{" "}
                  <span className="font-semibold text-gray-700">
                    {activeTab === "classmates" ? students.length : sortedGroups.length}
                  </span>{" "}
                  kết quả cho từ khóa{" "}
                  <span className="font-semibold text-orange-600">&ldquo;{query}&rdquo;</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Tìm bạn học, nhóm học..."
                className="w-full h-10 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-hidden focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-orange-500">
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("classmates")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "classmates"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <GraduationCap size={16} />
                Bạn học ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("groups")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  activeTab === "groups"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users size={16} />
                Nhóm học cộng đồng ({sortedGroups.length})
              </button>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs text-gray-400">Sắp xếp:</span>
              {activeTab === "classmates" ? (
                <SortDropdown
                  value={sortOrder}
                  onChange={setSortOrder}
                  options={STUDENT_SORT_OPTIONS}
                />
              ) : (
                <SortDropdown
                  value={groupSortOrder}
                  onChange={setGroupSortOrder}
                  options={GROUP_SORT_OPTIONS}
                />
              )}
            </div>
          </div>

          {activeTab === "classmates" ? (
            <div>
              {loadingStudents ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => <StudentCardSkeleton key={i} />)}
                </div>
              ) : students.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy bạn học"
                  description={query ? `Không có học viên nào khớp với "${query}"` : ""}
                  imageUrl="https://app.studystream.live/assets/images/onboarding-slides/explanation-slide.png"
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sortedStudents.map((student) => (
                    <StudentCardComponent
                      key={student.userId}
                      student={student}
                      currentUserId={currentUserId}
                      onViewProfile={handleViewProfile}
                      onConnect={handleConnect}
                      onMessage={handleMessage}
                      isConnecting={connectingUserId === student.userId}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {loadingGroups ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <CommunityGroupCardSkeleton />
                  <CommunityGroupCardSkeleton />
                  <CommunityGroupCardSkeleton />
                </div>
              ) : sortedGroups.length === 0 ? (
                <EmptyState
                  title="Không tìm thấy nhóm học"
                  description=""
                  imageUrl="https://app.studystream.live/assets/images/onboarding-slides/result-slide.png"
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sortedGroups.map((group: CommunityGroup) => (
                    <CommunityGroupCard key={group.id} group={group} onJoin={handleOpenJoinModal} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
    </main>
  );
}
