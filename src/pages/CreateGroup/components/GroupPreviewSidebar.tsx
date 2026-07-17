import { AutoAwesomeMosaicOutlined } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { DAYS } from "../../Onboarding/components/constants";
import type { FreeTime } from "../../Onboarding/components/types";
import {
  getFriendsListService,
  type FriendListItem,
} from "../../../services/FriendService";

type FriendPreviewItem = FriendListItem & {
  invited: boolean;
};

const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-rose-400",
  "bg-blue-500",
  "bg-lime-500",
  "bg-pink-400",
  "bg-red-400",
  "bg-yellow-500",
  "bg-emerald-500",
];

function getAvatarColor(userId: number) {
  const safeId = Number.isFinite(userId) ? userId : 0;
  return AVATAR_COLORS[safeId % AVATAR_COLORS.length];
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "?";
}

interface CreateGroupDraft {
  groupName: string;
  goalDescription: string;
  mainSubject: string;
  maxMembers: number;
  visibility: "public" | "private";
  freeTime: FreeTime;
  avatarPreview?: string | null;
}

export default function GroupPreviewSidebar({
  draft,
  invitedUserIds,
  onInvitedUserIdsChange,
}: {
  draft: CreateGroupDraft;
  invitedUserIds: number[];
  onInvitedUserIdsChange: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const [friends, setFriends] = useState<FriendPreviewItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    const loadFriends = async () => {
      setLoadingFriends(true);
      setFriendsError("");

      try {
        const response = await getFriendsListService();
        const nextFriends = Array.isArray(response.data) ? response.data : [];

        if (!active) return;

        setFriends(
          nextFriends.map((friend) => ({
            ...friend,
            invited: invitedUserIds.includes(friend.user_id),
          })),
        );
      } catch {
        if (active) {
          setFriends([]);
          setFriendsError("Không tải được danh sách bạn bè");
        }
      } finally {
        if (active) {
          setLoadingFriends(false);
        }
      }
    };

    loadFriends();

    return () => {
      active = false;
    };
  }, [invitedUserIds]);

  const filteredFriends = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return friends;
    }

    return friends.filter((friend) =>
      friend.full_name.toLowerCase().includes(keyword),
    );
  }, [friends, searchTerm]);

  const totalSelectedSlots = useMemo(() => {
    return DAYS.reduce(
      (acc, d) =>
        acc + Object.values(draft.freeTime[d.id]).filter(Boolean).length,
      0,
    );
  }, [draft.freeTime]);

  const invitedMembers = useMemo(
    () => friends.filter((friend) => invitedUserIds.includes(friend.user_id)),
    [friends, invitedUserIds],
  );

  const visibilityLabel =
    draft.visibility === "public" ? "Công khai" : "Riêng tư";
  const previewName = draft.groupName.trim() || "Tên nhóm của bạn";

  return (
    <aside className="lg:col-span-4">
      <section className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">
          Xem trước nhóm
        </h3>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex gap-3">
            {draft.avatarPreview ? (
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                <img src={draft.avatarPreview} alt="Group Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <AutoAwesomeMosaicOutlined fontSize="small" />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {previewName}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {draft.maxMembers} thành viên · {visibilityLabel}
              </p>
            </div>
          </div>

          {draft.goalDescription.trim() && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
              {draft.goalDescription.trim()}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {draft.mainSubject ? (
              <Badge>{draft.mainSubject}</Badge>
            ) : (
              <Badge tone="muted">Chưa chọn môn</Badge>
            )}

            {totalSelectedSlots > 0 ? (
              <Badge>{totalSelectedSlots} slot rảnh</Badge>
            ) : (
              <Badge tone="muted">Chưa chọn thời gian</Badge>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Bạn bè hiện tại
            </h3>
          </div>

          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm bạn bè"
            className="mb-3 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50"
          />

          {invitedMembers.length > 0 && (
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-slate-700">
                Đang mời ({invitedMembers.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {invitedMembers.map((m) => (
                  <span
                    key={m.user_id}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {m.full_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loadingFriends ? (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
              <CircularProgress size={22} />
            </div>
          ) : friendsError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {friendsError}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
              Không có bạn bè phù hợp
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <MemberCard
                  key={friend.user_id}
                  member={friend}
                  invited={invitedUserIds.includes(friend.user_id)}
                  onInvite={() =>
                    onInvitedUserIdsChange((prev) =>
                      prev.includes(friend.user_id)
                        ? prev
                        : [...prev, friend.user_id],
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: import("react").ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <span
      className={
        "rounded-full border px-3 py-1 text-xs font-medium " +
        (tone === "muted"
          ? "border-slate-200 bg-white text-slate-500"
          : "border-slate-200 bg-white text-slate-700")
      }
    >
      {children}
    </span>
  );
}

function MemberCard({
  member,
  invited,
  onInvite,
}: {
  member: FriendListItem;
  invited: boolean;
  onInvite: () => void;
}) {
  const initials = getInitials(member.full_name);
  const avatarBg = getAvatarColor(member.user_id);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex min-w-0 items-center gap-3">
        {member.avatar_url ? (
          <div
            className="size-10 shrink-0 rounded-full bg-slate-200 bg-cover bg-center"
            style={{
              backgroundImage: `url('${member.avatar_url}')`,
            }}
          />
        ) : (
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${avatarBg} text-xs font-bold text-white`}
          >
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {member.full_name}
          </p>
          <p className="truncate text-xs text-slate-500">
            {member.avatar_url ? "" : "Chưa có ảnh đại diện"}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={invited}
        onClick={onInvite}
        className={
          "ml-3 rounded-lg border px-3 py-1.5 text-xs font-medium transition " +
          (invited
            ? "cursor-not-allowed border-blue-200 bg-blue-50 text-blue-700"
            : "border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600")
        }
      >
        {invited ? "Đang mời" : "Mời"}
      </button>
    </div>
  );
}
