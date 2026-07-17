import { BookOpen, ChevronRight, Crown, Loader2, Plus, Send, UserPlus, UserX, Users, X, Camera, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReportModal from "../../components/modal/ReportModal";
import CreateGroupModal from "./components/CreateGroupModal";
import groupImg from "../../assets/img/group.png";
import {
  getActiveGroupMembers,
  getActiveGroupMemberIds,
  getGroupAvatarUrl,
  getGroupInvitations,
  getGroupsByUserId,
  GroupInvitationResponse,
  kickGroupMember,
  sendGroupInvitation,
  StudyGroupDetailResponse,
  getSentPendingGroupJoinRequests,
  updateStudyGroup,
  deleteStudyGroup,
  getAllSubjectsByCurriculum,
  Subject,
  getGroupById,
  leaveGroup,
} from "../../services/GroupService";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  loadFriendListService,
  FriendUser,
  loadFriendProfilesService,
  normalizeAvatarUrl,
} from "../../services/FriendService";
import { toast } from "react-toastify";
import SuggestedGroupsSection from "../StudyConnection/components/SuggestedGroupsSection";
import { JoinRequestsPanel, SentRequestsPanel } from "../StudyConnection/components/StudyGroupsSection";

const GROUP_TABS = [
  { id: "suggested", label: "Gợi ý nhóm học" },
  { id: "join-requests", label: "Yêu cầu tham gia" },
  { id: "sent-requests", label: "Nhóm đã gửi" },
  { id: "my-groups", label: "Nhóm của tôi" },
] as const;

type GroupMemberProfile = FriendUser & {
  role?: string | null;
  status?: string | null;
};

type InvitationStatusByUserId = Record<number, GroupInvitationResponse>;

const canManageMembers = (role?: string | null) => {
  const normalizedRole = role?.toUpperCase();
  return normalizedRole === "OWNER" || normalizedRole === "ADMIN";
};

const getRoleLabel = (role?: string | null, isOwnerByGroupDetail = false) => {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === "OWNER" || isOwnerByGroupDetail) return "Trưởng nhóm";
  if (normalizedRole === "ADMIN") return "Quản trị nhóm";
  return "Thành viên";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarBg = (id: number) => {
  const colors = [
    "from-blue-500 to-blue-500",
    "from-rose-500 to-pink-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
  ];
  return colors[id % colors.length];
};

function GroupPreviewCard({
  group,
  onOpenDetail,
}: {
  group: StudyGroupDetailResponse;
  onOpenDetail: (group: StudyGroupDetailResponse) => void;
}) {
  const isGroupActive = group.status === "ACTIVE" || group.status === "active";

  return (
    <article
      onClick={() => onOpenDetail(group)}
      className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_20px_rgba(37, 99, 235,0.04)]"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-xs font-semibold tracking-wider text-blue-500 uppercase">
            {group.subjectName}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-1.5 w-1.5 rounded-full ${isGroupActive ? "bg-emerald-500" : "bg-gray-400"}`} />
            {isGroupActive ? "Đang mở" : "Đã đóng"}
          </span>
        </div>

        <div className="flex gap-4 items-start mb-6">
          {getGroupAvatarUrl(group) ? (
            <img
              src={getGroupAvatarUrl(group) || undefined}
              alt={group.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm shrink-0"
            >
              {getInitials(group.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-500 transition-colors mb-2">
              {group.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {group.description || "Không có mô tả cho nhóm học này."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            Tối đa {group.maxMembers}
          </span>
        </div>

        <span className="text-xs font-semibold text-blue-500 group-hover:underline inline-flex items-center gap-0.5">
          Chi tiết
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

function GroupPreviewCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 min-h-[180px]">
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-200" />
            <div className="h-3 w-12 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="flex gap-4 items-start mb-6">
          <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-5 w-2/3 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-3.5 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function GroupPage() {
  const navigate = useNavigate();
  const [groupList, setGroupList] = useState<StudyGroupDetailResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupDetailResponse | null>(null);
  const [members, setMembers] = useState<GroupMemberProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [kickingUserId, setKickingUserId] = useState<number | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitingUserIds, setInvitingUserIds] = useState<number[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);
  const [invitationStatusByUserId, setInvitationStatusByUserId] = useState<InvitationStatusByUserId>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const currentUserId = Number(localStorage.getItem("userId"));

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMainSubjectId, setEditMainSubjectId] = useState<number>(0);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editMaxMembers, setEditMaxMembers] = useState(5);
  const [editVisibility, setEditVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await getAllSubjectsByCurriculum(1);
        setSubjects(response.data || []);
      } catch (error) {
        console.error("Failed to load subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [isEditing]);

  useEffect(() => {
    if (selectedGroup) {
      setEditName(selectedGroup.name || "");
      setEditDescription(selectedGroup.description || "");
      setEditMainSubjectId(selectedGroup.mainSubjectId || 0);
      setEditSubjectName(selectedGroup.subjectName || "");
      setEditMaxMembers(selectedGroup.maxMembers || 5);
      setEditVisibility(
        selectedGroup.visibility?.toUpperCase() === "PRIVATE" ? "PRIVATE" : "PUBLIC"
      );
      setEditAvatarFile(null);
      setEditAvatarPreview(getGroupAvatarUrl(selectedGroup));
      setIsEditing(false);
    }
  }, [selectedGroup]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setIsSavingGroup(true);
    try {
      const res = await updateStudyGroup(
        selectedGroup.id,
        {
          name: editName,
          description: editDescription,
          mainSubjectId: editMainSubjectId,
          subjectName: editSubjectName,
          maxMembers: editMaxMembers,
          visibility: editVisibility,
        },
        editAvatarFile || undefined
      );

      if (res.success) {

        try {
          const detailRes = await getGroupById(selectedGroup.id);
          if (detailRes.success && detailRes.data) {
            setSelectedGroup(detailRes.data);
          } else {
            setSelectedGroup(prev => prev ? {
              ...prev,
              name: editName,
              description: editDescription,
              mainSubjectId: editMainSubjectId,
              subjectName: editSubjectName,
              maxMembers: editMaxMembers,
              visibility: editVisibility,
            } : null);
          }
        } catch (detailErr) {
          console.error("Failed to load updated group details:", detailErr);
          setSelectedGroup(prev => prev ? {
            ...prev,
            name: editName,
            description: editDescription,
            mainSubjectId: editMainSubjectId,
            subjectName: editSubjectName,
            maxMembers: editMaxMembers,
            visibility: editVisibility,
          } : null);
        }

        fetchGroups();
        setIsEditing(false);
      } else {
        toast.error("Cập nhật thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Failed to update group:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật nhóm.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhóm học này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    setIsDeletingGroup(true);
    try {
      const res = await deleteStudyGroup(selectedGroup.id);
      if (res.success) {
        toast.success("Xóa nhóm học thành công!");
        closeGroupDetail();
        fetchGroups();
      } else {
        toast.error("Xóa nhóm thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Đã xảy ra lỗi khi xóa nhóm.");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn rời nhóm học này không?")) {
      return;
    }

    setLeavingGroupId(groupId);
    try {
      const res = await leaveGroup(groupId);
      if (res.success) {
        toast.success("Rời nhóm thành công!");
        closeGroupDetail();
        fetchGroups();
        window.dispatchEvent(new Event("group_list_updated"));
      } else {
        toast.error("Rời nhóm thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Failed to leave group:", error);
      toast.error("Đã xảy ra lỗi khi rời nhóm.");
    } finally {
      setLeavingGroupId(null);
    }
  };

  type GroupTabId = "suggested" | "join-requests" | "sent-requests" | "my-groups";
  const [activeTab, setActiveTab] = useState<GroupTabId>("my-groups");
  const [counts, setCounts] = useState<Record<GroupTabId, number>>({
    suggested: 0,
    "join-requests": 0,
    "sent-requests": 0,
    "my-groups": 0,
  });

  const fetchBadgeCounts = async () => {
    if (!currentUserId) return;
    try {
      const sentRes = await getSentPendingGroupJoinRequests();
      if (sentRes.success && Array.isArray(sentRes.data)) {
        setCounts((prev) => ({ ...prev, "sent-requests": sentRes.data.length }));
      }

      const groupsRes = await getGroupsByUserId(currentUserId);
      if (groupsRes.success && Array.isArray(groupsRes.data)) {
        const groups = groupsRes.data;
        const results = await Promise.allSettled(
          groups.map((group) => getGroupInvitations(group.id)),
        );
        const nextRequests = results
          .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
          .flatMap((result) => result.value.data ?? [])
          .filter(
            (invitation) =>
              invitation.status === "PENDING" &&
              invitation.inviterUserId === invitation.inviteeUserId,
          );
        setCounts((prev) => ({ ...prev, "join-requests": nextRequests.length }));
      }
    } catch (e) {
      console.error("Error fetching group request counts:", e);
    }
  };

  useEffect(() => {
    fetchBadgeCounts();
  }, [currentUserId]);

  useEffect(() => {
    setCounts((prev) => ({ ...prev, "my-groups": groupList.length }));
  }, [groupList]);

  const fetchGroups = async () => {
    setLoading(true);
    const res = await getGroupsByUserId(Number(localStorage.getItem("userId")));
    if (res.success) {
      setGroupList(res.data);
    } else {
      toast.error("Lấy nhóm thất bại: " + (res.message || "Lỗi không xác định"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleGroupListUpdated = () => {
      fetchGroups();
    };
    const handleGroupInvitationsUpdated = () => {
      fetchBadgeCounts();
    };

    window.addEventListener("group_list_updated", handleGroupListUpdated);
    window.addEventListener("group_invitations_updated", handleGroupInvitationsUpdated);
    return () => {
      window.removeEventListener("group_list_updated", handleGroupListUpdated);
      window.removeEventListener("group_invitations_updated", handleGroupInvitationsUpdated);
    };
  }, []);

  const goToCreateGroup = () => {
    setCreateModalOpen(true);
  };

  const openGroupDetail = async (group: StudyGroupDetailResponse) => {
    setSelectedGroup(group);
    setMembers([]);
    setInvitePanelOpen(false);
    setInviteSearch("");
    setInvitedUserIds([]);
    setInvitationStatusByUserId({});
    setReportModalOpen(false);
    setMembersLoading(true);

    try {
      const membersWithRoleRes = await getActiveGroupMembers(group.id);
      let memberIds: number[] = [];
      let memberRoles = new Map<number, { role?: string | null; status?: string | null }>();

      if (membersWithRoleRes.success && Array.isArray(membersWithRoleRes.data)) {
        memberIds = membersWithRoleRes.data.map((member) => member.userId);
        memberRoles = new Map(
          membersWithRoleRes.data.map((member) => [
            member.userId,
            { role: member.role, status: member.status },
          ]),
        );
      } else {
        const membersRes = await getActiveGroupMemberIds(group.id);
        if (!membersRes.success) {
          toast.error(membersRes.message || "Không thể lấy danh sách thành viên.");
          return;
        }
        memberIds = membersRes.data || [];
      }

      if (memberIds.length === 0) {
        setMembers([]);
        return;
      }

      const profiles = await loadFriendProfilesService(memberIds);
      const profilesWithRole = profiles.map((profile) => ({
        ...profile,
        ...memberRoles.get(profile.userId),
      }));

      setMembers(
        [...profilesWithRole].sort((a, b) => {
          const aCanManage = canManageMembers(a.role) || Number(a.userId) === Number(group.ownerUserId);
          const bCanManage = canManageMembers(b.role) || Number(b.userId) === Number(group.ownerUserId);
          if (aCanManage && !bCanManage) return -1;
          if (!aCanManage && bCanManage) return 1;
          return 0;
        }),
      );

      if (Number(group.ownerUserId) === Number(currentUserId)) {
        await loadInvitationStatuses(group.id);
      }
    } catch (error) {
      console.error("Load group members failed:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách thành viên.");
    } finally {
      setMembersLoading(false);
    }
  };

  const closeGroupDetail = () => {
    setSelectedGroup(null);
    setMembers([]);
    setKickingUserId(null);
    setFriends([]);
    setInvitePanelOpen(false);
    setInviteSearch("");
    setInvitingUserIds([]);
    setInvitedUserIds([]);
    setInvitationStatusByUserId({});
    setReportModalOpen(false);
  };

  const loadInvitationStatuses = async (groupId: number) => {
    try {
      const res = await getGroupInvitations(groupId);
      if (res.success && Array.isArray(res.data)) {
        setInvitationStatusByUserId(
          res.data.reduce<InvitationStatusByUserId>((acc, invitation) => {
            if (invitation.inviteeUserId) {
              acc[invitation.inviteeUserId] = invitation;
            }
            return acc;
          }, {}),
        );
      }
    } catch (error) {
      console.error("Load group invitation statuses failed:", error);
    }
  };

  const loadInviteCandidates = async () => {
    if (friends.length > 0 || friendsLoading) return;

    setFriendsLoading(true);
    try {
      const data = await loadFriendListService(currentUserId);
      setFriends(data);
    } catch (error) {
      console.error("Load friends for group invitation failed:", error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const toggleInvitePanel = async () => {
    const nextOpen = !invitePanelOpen;
    setInvitePanelOpen(nextOpen);
    if (nextOpen) {
      await loadInviteCandidates();
    }
  };

  const handleInviteFriend = async (friend: FriendUser) => {
    if (!selectedGroup || invitingUserIds.includes(friend.userId) || invitedUserIds.includes(friend.userId)) {
      return;
    }

    setInvitingUserIds((prev) => [...prev, friend.userId]);
    try {
      const res = await sendGroupInvitation(selectedGroup.id, friend.userId);
      if (res.success) {
        setInvitedUserIds((prev) => [...prev, friend.userId]);
        if (res.data) {
          setInvitationStatusByUserId((prev) => ({
            ...prev,
            [friend.userId]: res.data,
          }));
        }
      } else {
        console.error(res.message || "Không thể gửi lời mời vào nhóm.");
      }
    } catch (error) {
      console.error("Send group invitation failed:", error);
    } finally {
      setInvitingUserIds((prev) => prev.filter((id) => id !== friend.userId));
    }
  };

  const handleKickMember = async (member: GroupMemberProfile) => {
    if (!selectedGroup) return;

    setKickingUserId(member.userId);
    try {
      const res = await kickGroupMember(selectedGroup.id, member.userId);
      if (res.success) {
        setMembers((prev) => prev.filter((item) => item.userId !== member.userId));
      } else {
        console.error("Cannot remove group member:", res.message);
      }
    } catch (error) {
      console.error("Kick group member failed:", error);
    } finally {
      setKickingUserId(null);
    }
  };

  const currentMember = members.find((member) => Number(member.userId) === Number(currentUserId));
  const isCurrentUserOwner =
    Boolean(selectedGroup) &&
    (Number(selectedGroup?.ownerUserId) === Number(currentUserId) || currentMember?.role?.toUpperCase() === "OWNER");
  const isSelectedGroupOwner =
    Boolean(selectedGroup) &&
    (isCurrentUserOwner || canManageMembers(currentMember?.role));
  const canInviteMembers =
    Boolean(selectedGroup) &&
    (isCurrentUserOwner || currentMember?.role?.toUpperCase() === "OWNER");
  const memberIds = useMemo(() => new Set(members.map((member) => member.userId)), [members]);
  const visibleInviteCandidates = useMemo(() => {
    const keyword = inviteSearch.trim().toLowerCase();
    return friends
      .filter((friend) => friend.userId !== currentUserId && !memberIds.has(friend.userId))
      .filter((friend) => {
        if (!keyword) return true;
        return `${friend.fullName ?? ""} ${friend.email ?? ""}`.toLowerCase().includes(keyword);
      });
  }, [currentUserId, friends, inviteSearch, memberIds]);

  useEffect(() => {
    const handleInvitationStatusUpdated = (event: Event) => {
      const detail = (event as CustomEvent<any>).detail;
      if (!selectedGroup || Number(detail?.groupId) !== Number(selectedGroup.id)) {
        return;
      }

      const inviteeUserId = Number(detail?.inviteeUserId);
      if (!Number.isFinite(inviteeUserId)) {
        return;
      }

      setInvitedUserIds((prev) => prev.filter((id) => id !== inviteeUserId));
      setInvitationStatusByUserId((prev) => ({
        ...prev,
        [inviteeUserId]: {
          ...(prev[inviteeUserId] || {}),
          invitationId: Number(detail?.invitationId || prev[inviteeUserId]?.invitationId || 0),
          groupId: selectedGroup.id,
          groupName: detail?.groupName || selectedGroup.name,
          inviterUserId: currentUserId,
          inviteeUserId,
          inviterName: "",
          status: detail?.status || "REJECTED",
          createdAt: prev[inviteeUserId]?.createdAt || new Date().toISOString(),
        },
      }));
    };

    window.addEventListener("group_invitation_status_updated", handleInvitationStatusUpdated);
    return () => window.removeEventListener("group_invitation_status_updated", handleInvitationStatusUpdated);
  }, [currentUserId, selectedGroup]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "suggested":
        return <SuggestedGroupsSection />;
      case "join-requests":
        return (
          <JoinRequestsPanel
            onCountChange={(count) => setCounts((prev) => ({ ...prev, "join-requests": count }))}
          />
        );
      case "sent-requests":
        return (
          <SentRequestsPanel
            onCountChange={(count) => setCounts((prev) => ({ ...prev, "sent-requests": count }))}
          />
        );
      case "my-groups":
      default:
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <GroupPreviewCardSkeleton key={index} />
                ))}
              </div>
            ) : groupList.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <BookOpen size={24} />
                </div>

                <h3 className="text-lg font-bold text-gray-900">Bạn chưa tham gia nhóm nào</h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Tạo nhóm học mới để trao đổi tài liệu, giải bài tập và đồng hành cùng các bạn học khác.
                </p>

                <button
                  onClick={goToCreateGroup}
                  className="mt-6 inline-flex items-center gap-2 h-10 rounded-lg bg-blue-500 px-5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} />
                  Tạo nhóm mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {groupList.map((group) => (
                  <GroupPreviewCard
                    key={group.id}
                    group={group}
                    onOpenDetail={openGroupDetail}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <main className="px-6 py-8 sm:px-8 lg:px-10 bg-blue-50/30 min-h-screen">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={groupImg}
                alt="Nhóm học"
                className="h-28 w-auto object-contain mix-blend-multiply"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800">Nhóm học</h1>
                <p className="text-sm text-gray-500">
                  Tìm kiếm, tham gia và quản lý các nhóm học tập của bạn.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={goToCreateGroup}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              Tạo nhóm mới
            </button>
          </div>
        </section>

        {/* Tab Bar */}
        <div className="flex">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            {GROUP_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              const showBadge = (tab.id === "join-requests" || tab.id === "sent-requests") && count > 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${isActive
                    ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-transparent bg-transparent text-gray-500 hover:text-blue-600"
                    }`}
                >
                  {tab.label}
                  {showBadge && (
                    <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {selectedGroup && !reportModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4 py-6">
          <section className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  {selectedGroup.subjectName}
                </p>
                <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
                  {selectedGroup.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {isSelectedGroupOwner
                    ? "Bạn là trưởng nhóm, có thể mời hoặc xóa thành viên khỏi nhóm."
                    : "Danh sách thành viên đang hoạt động trong nhóm."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isCurrentUserOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      disabled={leavingGroupId === selectedGroup.id}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {leavingGroupId === selectedGroup.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <LogOut size={14} />
                      )}
                      Rời nhóm
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="inline-flex h-9 items-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 cursor-pointer"
                    >
                      Báo cáo
                    </button>
                  </>
                )}
                {isSelectedGroupOwner &&
                  selectedGroup.visibility?.toUpperCase() !== "COMMUNITY" && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`inline-flex h-9 items-center px-3 text-sm font-semibold rounded-md border transition-colors cursor-pointer ${isEditing
                        ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {isEditing ? "Xem thành viên" : "Chỉnh sửa"}
                    </button>
                  )}
                {canInviteMembers && !isEditing && (
                  <button
                    type="button"
                    onClick={toggleInvitePanel}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    <UserPlus size={16} />
                    Mời thành viên
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeGroupDetail}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="space-y-4 py-2">
                  {/* Centered Avatar Uploader */}
                  <div className="flex flex-col items-center justify-center border-b border-gray-100 pb-5">
                    <div
                      className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-150 transition-colors group shadow-inner"
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      {editAvatarPreview ? (
                        <img src={editAvatarPreview} alt="Group Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-lg uppercase">
                          {selectedGroup?.name ? selectedGroup.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "G"}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditAvatarFile(file);
                          setEditAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="mt-2 text-xs text-gray-500 font-medium font-sans">Chọn ảnh đại diện nhóm</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-sans">Tên nhóm</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-sans">Môn học</label>
                      {loadingSubjects ? (
                        <div className="h-10 flex items-center text-xs text-gray-400">Đang tải môn học...</div>
                      ) : (
                        <select
                          value={editMainSubjectId}
                          onChange={(e) => {
                            const selectedId = Number(e.target.value);
                            setEditMainSubjectId(selectedId);
                            const subObj = subjects.find(s => s.subjectId === selectedId);
                            if (subObj) {
                              setEditSubjectName(subObj.subjectName);
                            }
                          }}
                          className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white"
                        >
                          <option value={0}>Chọn môn học</option>
                          {subjects.map((sub) => (
                            <option key={sub.subjectId} value={sub.subjectId}>
                              {sub.subjectName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-sans">Mô tả nhóm</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800 resize-none"
                      placeholder="Mô tả mục tiêu học tập của nhóm..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-sans">Thành viên tối đa</label>
                      <input
                        type="number"
                        min={1}
                        value={editMaxMembers}
                        onChange={(e) => setEditMaxMembers(Number(e.target.value))}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-sans">Trạng thái hiển thị</label>
                      <select
                        value={editVisibility}
                        onChange={(e) => setEditVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
                        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800 bg-white"
                      >
                        <option value="PUBLIC">Công khai (Public)</option>
                        <option value="PRIVATE">Riêng tư (Private)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleDeleteGroup}
                      disabled={isDeletingGroup || isSavingGroup}
                      className="w-full sm:w-auto h-10 px-5 text-sm font-semibold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 hover:border-red-600 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeletingGroup ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                      Xóa nhóm
                    </button>

                    <div className="w-full sm:w-auto flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={isSavingGroup || isDeletingGroup}
                        className="w-full sm:w-auto h-10 px-5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingGroup || isDeletingGroup}
                        className="w-full sm:w-auto h-10 px-6 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isSavingGroup ? <Loader2 size={16} className="animate-spin" /> : null}
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {invitePanelOpen && (
                    <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">Mời bạn bè vào nhóm</h3>
                        </div>
                        <input
                          value={inviteSearch}
                          onChange={(event) => setInviteSearch(event.target.value)}
                          placeholder="Tìm bạn bè..."
                          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-400 sm:w-56"
                        />
                      </div>

                      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                        {friendsLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={index}
                                className="animate-pulse flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-3"
                              >
                                <div className="flex min-w-0 items-center gap-3 flex-1">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                                  <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                  </div>
                                </div>
                                <div className="h-9 w-16 bg-gray-200 rounded-md shrink-0" />
                              </div>
                            ))}
                          </div>
                        ) : visibleInviteCandidates.length === 0 ? (
                          <div className="rounded-md border border-dashed border-blue-200 bg-white/70 p-4 text-center text-sm text-gray-500">
                            Không tìm thấy bạn bè
                          </div>
                        ) : (
                          visibleInviteCandidates.map((friend) => {
                            const isInviting = invitingUserIds.includes(friend.userId);
                            const invitationStatus = invitationStatusByUserId[friend.userId]?.status;
                            const isPending = invitationStatus === "PENDING";
                            const isInvited = invitedUserIds.includes(friend.userId) || isPending;

                            return (
                              <div
                                key={friend.userId}
                                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-3"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {friend.avatarUrl ? (
                                    <img
                                      src={normalizeAvatarUrl(friend.avatarUrl) || undefined}
                                      alt={friend.fullName}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                                      {friend.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-gray-900">
                                      {friend.fullName || `User ${friend.userId}`}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">
                                      {friend.email || "Bạn bè StudyMatch"}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleInviteFriend(friend)}
                                  disabled={isInviting || isPending}
                                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-blue-200 px-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                                >
                                  {isInviting ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Send size={15} />
                                  )}
                                  {isPending ? "Đang chờ xác nhận" : isInvited ? "Đã mời" : "Mời"}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {membersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3 flex-1">
                            <div className="h-11 w-11 rounded-full bg-gray-200 shrink-0" />
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="h-4 w-1/4 bg-gray-200 rounded" />
                              <div className="h-3 w-1/6 bg-gray-200 rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : members.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                      Nhóm chưa có thành viên đang hoạt động.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => {
                        const isOwner = Number(member.userId) === Number(selectedGroup.ownerUserId) || member.role?.toUpperCase() === "OWNER";
                        const memberCanManage =
                          canManageMembers(member.role) || Number(member.userId) === Number(selectedGroup.ownerUserId);
                        const isCurrentUser = member.userId === currentUserId;
                        const canKick = isSelectedGroupOwner && !isCurrentUser && !memberCanManage;
                        const roleLabel = getRoleLabel(member.role, isOwner);

                        return (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {member.avatarUrl ? (
                                <img
                                  src={normalizeAvatarUrl(member.avatarUrl) || undefined}
                                  alt={member.fullName}
                                  className="h-11 w-11 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => navigate(`/profile/${member.userId}`)}
                                />
                              ) : (
                                <div 
                                  className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => navigate(`/profile/${member.userId}`)}
                                >
                                  {member.fullName?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-2">
                                  <p 
                                    className="truncate text-sm font-bold text-gray-900 cursor-pointer hover:text-blue-500 hover:underline transition-colors"
                                    onClick={() => navigate(`/profile/${member.userId}`)}
                                  >
                                    {member.fullName || `User ${member.userId}`}
                                  </p>
                                  {isCurrentUser && (
                                    <span className="shrink-0 text-xs text-gray-500">(Bạn)</span>
                                  )}
                                </div>
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
                                  {memberCanManage && <Crown size={13} className="text-blue-600" />}
                                  {roleLabel}
                                </p>
                              </div>
                            </div>

                            {canKick && (
                              <button
                                type="button"
                                onClick={() => handleKickMember(member)}
                                disabled={kickingUserId === member.userId}
                                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {kickingUserId === member.userId ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <UserX size={15} />
                                )}
                                Xóa
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}

      <ReportModal
        open={reportModalOpen && Boolean(selectedGroup)}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedGroup(null);
        }}
        targetType="GROUP"
        targetId={selectedGroup?.id || 0}
        targetName={selectedGroup?.name}
      />

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchGroups}
      />
    </main>
  );
}
