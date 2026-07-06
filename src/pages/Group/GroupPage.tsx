import { BookOpen, ChevronRight, Crown, Loader2, Plus, Send, UserPlus, UserX, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "./components/CreateGroupModal";
import {
  getActiveGroupMembers,
  getActiveGroupMemberIds,
  getGroupInvitations,
  getGroupsByUserId,
  GroupInvitationResponse,
  kickGroupMember,
  sendGroupInvitation,
  StudyGroupDetailResponse,
} from "../../services/GroupService";
import { useEffect, useMemo, useState } from "react";
import {
  loadFriendListService,
  FriendUser,
  loadFriendProfilesService,
  normalizeAvatarUrl,
} from "../../services/FriendService";

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
      className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.04)]"
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
            {group.subjectName}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-1.5 w-1.5 rounded-full ${isGroupActive ? "bg-emerald-500" : "bg-gray-400"}`} />
            {isGroupActive ? "Đang mở" : "Đã đóng"}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-500 transition-colors mb-2">
          {group.name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-6">
          {group.description || "Không có mô tả cho nhóm học này."}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            Tối đa {group.maxMembers}
          </span>

        </div>

        <span className="text-xs font-semibold text-orange-500 group-hover:underline inline-flex items-center gap-0.5">
          Chi tiết
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
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
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitingUserIds, setInvitingUserIds] = useState<number[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<number[]>([]);
  const [invitationStatusByUserId, setInvitationStatusByUserId] = useState<InvitationStatusByUserId>({});
  const currentUserId = Number(localStorage.getItem("userId"));

  const fetchGroups = async () => {
    setLoading(true);
    const res = await getGroupsByUserId(Number(localStorage.getItem("userId")));
    if (res.success) {
      setGroupList(res.data);
    } else {
      alert("Lấy nhóm thất bại: " + (res.message || "Lỗi không xác định"));
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

    window.addEventListener("group_list_updated", handleGroupListUpdated);
    return () => window.removeEventListener("group_list_updated", handleGroupListUpdated);
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
          alert(membersRes.message || "Không thể lấy danh sách thành viên.");
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
          const aCanManage = canManageMembers(a.role) || a.userId === group.ownerUserId;
          const bCanManage = canManageMembers(b.role) || b.userId === group.ownerUserId;
          if (aCanManage && !bCanManage) return -1;
          if (!aCanManage && bCanManage) return 1;
          return 0;
        }),
      );

      if (group.ownerUserId === currentUserId) {
        await loadInvitationStatuses(group.id);
      }
    } catch (error) {
      console.error("Load group members failed:", error);
      alert("Đã xảy ra lỗi khi lấy danh sách thành viên.");
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

  const currentMember = members.find((member) => member.userId === currentUserId);
  const isSelectedGroupOwner =
    Boolean(selectedGroup) &&
    (selectedGroup?.ownerUserId === currentUserId || canManageMembers(currentMember?.role));
  const canInviteMembers =
    Boolean(selectedGroup) &&
    (selectedGroup?.ownerUserId === currentUserId || currentMember?.role?.toUpperCase() === "OWNER");
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

  return (
    <main className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Nhóm học của tôi
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và chọn nhóm học tập phù hợp với lịch trình của bạn.
            </p>
          </div>

          <button
            onClick={goToCreateGroup}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shrink-0"
          >
            <Plus size={16} />
            Tạo nhóm mới
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
              <p className="text-sm text-gray-500">Đang tải danh sách nhóm học...</p>
            </div>
          </div>
        ) : groupList.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <BookOpen size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Bạn chưa tham gia nhóm nào</h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Tạo nhóm học mới để trao đổi tài liệu, giải bài tập và đồng hành cùng các bạn học khác.
            </p>

            <button
              onClick={goToCreateGroup}
              className="mt-6 inline-flex items-center gap-2 h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
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
      </div>

      {selectedGroup && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4 py-6">
          <section className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
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
                {canInviteMembers && (
                  <button
                    type="button"
                    onClick={toggleInvitePanel}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
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
              {invitePanelOpen && (
                <div className="mb-5 rounded-lg border border-orange-100 bg-orange-50/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Mời bạn bè vào nhóm</h3>
                    </div>
                    <input
                      value={inviteSearch}
                      onChange={(event) => setInviteSearch(event.target.value)}
                      placeholder="Tìm bạn bè..."
                      className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-orange-400 sm:w-56"
                    />
                  </div>

                  <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                    {friendsLoading ? (
                      <div className="flex min-h-[96px] items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      </div>
                    ) : visibleInviteCandidates.length === 0 ? (
                      <div className="rounded-md border border-dashed border-orange-200 bg-white/70 p-4 text-center text-sm text-gray-500">
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
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
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
                              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-orange-200 px-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
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
                <div className="flex min-h-[180px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  Nhóm chưa có thành viên đang hoạt động.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const isOwner = member.userId === selectedGroup.ownerUserId || member.role?.toUpperCase() === "OWNER";
                    const memberCanManage =
                      canManageMembers(member.role) || member.userId === selectedGroup.ownerUserId;
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
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                              {member.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-sm font-bold text-gray-900">
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
            </div>
          </section>
        </div>
      )}

      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchGroups}
      />
    </main>
  );
}
