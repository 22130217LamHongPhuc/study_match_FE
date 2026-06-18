import CallIcon from "@mui/icons-material/Call";
import PaletteIcon from "@mui/icons-material/Palette";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PushPinIcon from "@mui/icons-material/PushPin";
import InfoIcon from "@mui/icons-material/Info";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import WelcomeConversation from "../../components/conversation/WelcomeConversion";
import ListFriends from "../../components/conversation/ListFriends";
import ListMess from "../../components/conversation/ListMess";
import ForwardMessageModal from "../../components/conversation/ForwardMessageModal";
import ReplyMessage from "../../components/conversation/ReplyMessage";
import VideoCallModal from "../../components/conversation/VideoCallModal";
import { MessageInterface } from "../../model/Conversation";
import { APIResponse } from "../../model/APIResponse";
import { MessageStatusData, SocketData } from "../../model/SocketResponse";
import ColorPickerModal from "./components/ColorPickerModal";
import { getThemeById } from "../../theme/ConversationThemes";
import { ReactionData, ReactionDTO } from "../../model/Reaction";
import { VideoCallInfo } from "../../model/VideoCall";
import {
  loadConversation,
  loadConversationById,
  loadGroupConversation,
  recallMess,
  replyText,
  sendSeen,
  sendText,
  setMessagePinned,
  uploadMedia,
  updateConversationColor,
} from "../../services/ChatService";
import { getActiveGroupMemberIds } from "../../services/GroupService";
import { FriendUser, loadFriendProfilesService } from "../../services/FriendService";
import { getGroupStudySessions } from "../../services/StudySessionService";
import { rejectVideoCall, startVideoCall } from "../../services/VideoCallService";
import { StudySessionResponse } from "../StudySession/types";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import {
  clearUnread,
  increaseUnread,
  updateCurrentConverId,
  upsertGroupMemberProfiles,
} from "../../redux/ChatReducer";
import { badWords } from "@vnphu/vn-badwords";
const MESSAGE_PAGE_SIZE = 25;
const MESSAGE_LOADING_MIN_MS = 250;

const waitForMinLoading = async (startedAt: number) => {
  const remainingTime = MESSAGE_LOADING_MIN_MS - (Date.now() - startedAt);
  if (remainingTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
  }
};

const ConversationLoading = () => (
  <Box
    sx={{
      flex: 1,
      minHeight: 0,
      width: "100%",
      position: "relative",
      overflow: "hidden",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress
        size={48}
        thickness={4}
        sx={{
          color: "#b30000",
        }}
      />
    </Box>

  </Box>
);

type RouteState = {
  conversationKind?: "PRIVATE" | "GROUP";
  conversationType?: number;
  targetUserId?: number | null;
  groupId?: number | null;
  avatar?: string | null;
  fullName?: string | null;
  groupName?: string | null;
  conversationKey?: string | null;
} | null;

const isSocketData = (data: unknown): data is SocketData => {
  return !!data && typeof data === "object" && "conversationId" in data && "message" in data;
};

const isMessageStatusData = (data: unknown): data is MessageStatusData => {
  return !!data && typeof data === "object" && "conversationId" in data && "messageIds" in data && "status" in data;
};

const isReactionData = (data: unknown): data is ReactionData => {
  return !!data && typeof data === "object" && "conversationId" in data && "message" in data;
};
function hasBadWords(text: string) {
  return badWords(text, { validate: true });
}

const shouldApplyStatus = (
  currentStatus: MessageInterface["status"],
  nextStatus: MessageInterface["status"],
) => {
  if (!nextStatus) return false;
  const order = {
    SENDING: 0,
    SENT: 1,
    DELIVERED: 2,
    SEEN: 3,
  };
  return (order[nextStatus] ?? 0) >= (currentStatus ? order[currentStatus] : -1);
};

type GroupInfoTab = "schedule" | "pinned";

const getProfileDisplayName = (
  profile?: {
    fullName?: string | null;
    full_name?: string | null;
    name?: string | null;
    username?: string | null;
  },
) => {
  return profile?.fullName || profile?.full_name || profile?.name || profile?.username || null;
};

const sessionStatusLabel: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const studyModeLabel: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Trực tiếp",
  HYBRID: "Kết hợp",
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMessagePreview = (message: any) => {
  if (message.moderationStatus === "HATE" || message.moderation_status === "HATE" || message.moderationStatus === "OFFENSIVE" || message.moderation_status === "OFFENSIVE") return "Tin nhắn bị vi phạm chính sách";
  if (message.isDeleted) return "Tin nhắn đã được thu hồi";
  if (message.content?.trim()) return message.content;
  if (message.fileName) return message.fileName;
  if (message.mediaURL) return message.type?.startsWith("video/") ? "Video" : "Hình ảnh";
  return "Tin nhắn";
};

const isMessagePinned = (message: MessageInterface) => {
  const pinned = message.isPinned ?? message.pinned;
  return pinned === true || pinned === "Y";
};

const isPolicyViolationMessage = (message: any) => {
  return message.moderationStatus === "HATE" || message.moderation_status === "HATE" || message.moderationStatus === "OFFENSIVE" || message.moderation_status === "OFFENSIVE";
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ConversationPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUserId = Number(localStorage.getItem("userId"));
  const currentUser = useSelector((state: RootState) => state.user);
  const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId);
  const groupMemberProfiles = useSelector((state: RootState) => state.chat.groupMemberProfiles);
  const storeNewMess = useSelector((state: RootState) => state.chat.newMess);
  const storeEvent = useSelector((state: RootState) => state.chat.newMess?.event);

  const routeState = location.state as RouteState;
  const targetUserIdFromState = Number(routeState?.targetUserId);
  const targetUserId = Number.isFinite(targetUserIdFromState) && targetUserIdFromState > 0
    ? targetUserIdFromState
    : null;
  const groupIdFromState = Number(routeState?.groupId);
  const groupId = Number.isFinite(groupIdFromState) && groupIdFromState > 0 ? groupIdFromState : null;
  const isGroupConversation =
    routeState?.conversationKind === "GROUP" ||
    Number(routeState?.conversationType) === 0 ||
    groupId !== null;
  const fallbackConversationId = !targetUserId && !isGroupConversation ? currentConversationId : null;
  const routeAvatar = routeState?.avatar || null;
  const groupName = routeState?.groupName || null;
  const baseFullName = isGroupConversation
    ? groupName || "Nhom hoc"
    : routeState?.fullName || "Nguoi dung";
  const selectedConversationKey = isGroupConversation
    ? routeState?.conversationKey || (groupId ? `group:${groupId}` : "none")
    : targetUserId
      ? routeState?.conversationKey || `private:${targetUserId}`
      : fallbackConversationId
        ? `conversation:${fallbackConversationId}`
        : "none";

  const [conversation, setConversation] = useState<MessageInterface[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replymess, setReplyMess] = useState<MessageInterface | null>(null);
  const [forwardmess, setForwardMess] = useState<MessageInterface | null>(null);
  const [privateSenderProfiles, setPrivateSenderProfiles] = useState<Record<number, FriendUser>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [waitingVideoCall, setWaitingVideoCall] = useState<VideoCallInfo | null>(null);
  const [rejectedVideoCall, setRejectedVideoCall] = useState(false);
  const [cancelCallLoading, setCancelCallLoading] = useState(false);
  const [videoCallLoading, setVideoCallLoading] = useState(false);
  const [badWordsWarningOpen, setBadWordsWarningOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [groupInfoTab, setGroupInfoTab] = useState<GroupInfoTab>("schedule");
  const [groupSessions, setGroupSessions] = useState<StudySessionResponse[]>([]);
  const [groupSessionsLoading, setGroupSessionsLoading] = useState(false);
  const [groupSessionsError, setGroupSessionsError] = useState("");
  const [visibleMessageStatus, setVisibleMessageStatus] = useState<{
    messageId: number;
    status: MessageInterface["status"];
  } | null>(null);
  const [themeId, setThemeId] = useState<string>("default");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const conversationId = useRef<number | null>(null);
  const pendingTempMessageIds = useRef<number[]>([]);
  const nextTempMessageId = useRef(-1);
  const lastSeenMessageIdRef = useRef<number | null>(null);
  const nextMessagePageRef = useRef(1);
  const loadingOlderMessagesRef = useRef(false);
  const hasMoreMessagesRef = useRef(true);
  const activeConversationKeyRef = useRef("none");
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const loadedPrivateProfileIdsRef = useRef<Set<number>>(new Set());
  const conversationRef = useRef<MessageInterface[]>([]);

  useLayoutEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const privatePeerProfile = targetUserId
    ? privateSenderProfiles[targetUserId]
    : Object.values(privateSenderProfiles).find((profile) => profile.userId !== currentUserId);
  const fullName = isGroupConversation
    ? baseFullName
    : privatePeerProfile?.fullName || baseFullName;
  const avatar = isGroupConversation
    ? routeAvatar
    : privatePeerProfile?.avatarUrl || routeAvatar;
  const callTargetName = isGroupConversation ? groupName || "Nhóm hoc" : fullName;
  const callTargetAvatar = isGroupConversation ? null : avatar;
  const pinnedMessages = useMemo(
    () => conversation.filter(isMessagePinned),
    [conversation],
  );
  const getPinnedSenderName = useCallback((message: MessageInterface) => {
    if (message.senderId === currentUserId) {
      return currentUser.username || "Bạn";
    }

    if (isGroupConversation) {
      const profile = groupMemberProfiles[message.senderId];
      return getProfileDisplayName(profile) || `User ${message.senderId}`;
    }

    const profile = privateSenderProfiles[message.senderId];
    return getProfileDisplayName(profile) || fullName || `User ${message.senderId}`;
  }, [currentUser.username, currentUserId, fullName, groupMemberProfiles, isGroupConversation, privateSenderProfiles]);

  const setVisibleStatusIfNewer = useCallback((
    messageId: number,
    status: MessageInterface["status"],
  ) => {
    if (!status) return;
    setVisibleMessageStatus((prev) => {
      if (!prev || messageId >= prev.messageId || messageId < 0) {
        return { messageId, status };
      }
      return prev;
    });
  }, []);

  const markLatestIncomingSeen = useCallback((messages: MessageInterface[], targetConversationId: number | null) => {
    if (!targetConversationId || document.visibilityState !== "visible") return;

    const incomingMessageIds = messages
      .filter((message) => message.senderId !== currentUserId)
      .filter((message) => message.messageId > 0)
      .map((message) => message.messageId);

    if (incomingMessageIds.length === 0) return;

    const latestIncomingMessageId = Math.max(...incomingMessageIds);
    if (lastSeenMessageIdRef.current !== null && latestIncomingMessageId <= lastSeenMessageIdRef.current) return;

    sendSeen(targetConversationId, [latestIncomingMessageId])
      .then(() => {
        lastSeenMessageIdRef.current = latestIncomingMessageId;
        dispatch(clearUnread({ conversationId: targetConversationId }));
      })
      .catch(() => {
        lastSeenMessageIdRef.current = null;
      });
  }, [currentUserId, dispatch]);

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setMessageText((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!emojiPickerRef.current?.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!groupInfoOpen || !isGroupConversation || !groupId) return;

    let cancelled = false;
    setGroupSessionsLoading(true);
    setGroupSessionsError("");

    getGroupStudySessions(groupId, currentUserId)
      .then((response) => {
        if (cancelled) return;
        if (response.success && Array.isArray(response.data)) {
          setGroupSessions(response.data);
          return;
        }
        setGroupSessions([]);
        setGroupSessionsError(response.message || "Không thể tải lịch học nhóm");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[Conversation][load-group-sessions-error]", error);
        setGroupSessions([]);
        setGroupSessionsError("Không thể tải lịch học nhóm");
      })
      .finally(() => {
        if (!cancelled) setGroupSessionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, groupId, groupInfoOpen, isGroupConversation]);

  useLayoutEffect(() => {
    const loadMess = async () => {
      const loadKey = selectedConversationKey;
      activeConversationKeyRef.current = loadKey;

      if (!isGroupConversation && !targetUserId && !fallbackConversationId) {
        setConversation([]);
        conversationId.current = null;
        setLoadingConversation(false);
        return;
      }
      if (isGroupConversation && !groupId) {
        setConversation([]);
        conversationId.current = null;
        setLoadingConversation(false);
        return;
      }

      const loadingStartedAt = Date.now();
      nextMessagePageRef.current = 1;
      hasMoreMessagesRef.current = true;
      loadingOlderMessagesRef.current = false;
      lastSeenMessageIdRef.current = null;
      conversationId.current = null;
      pendingTempMessageIds.current = [];
      setHasMoreMessages(true);
      setLoadingOlderMessages(false);
      setVisibleMessageStatus(null);
      setReplyMess(null);
      setForwardMess(null);
      setGroupInfoOpen(false);
      setConversation([]);
      setLoadingConversation(true);

      try {
        const result: APIResponse = isGroupConversation
          ? await loadGroupConversation(currentUserId, groupId as number, 0)
          : targetUserId
            ? await loadConversation(currentUserId, targetUserId, 0)
            : await loadConversationById(currentUserId, fallbackConversationId as number, 0);

        if (activeConversationKeyRef.current !== loadKey) return;
        if (!result?.data) {
          setConversation([]);
          conversationId.current = null;
          return;
        }

        conversationId.current = result.data.conversationId;
        dispatch(updateCurrentConverId({ currentConversationId: result.data.conversationId }));

        const loadedMessages = (result.data.listMess || []) as MessageInterface[];
        setConversation(loadedMessages);

        const hasNextPage = loadedMessages.length === MESSAGE_PAGE_SIZE;
        hasMoreMessagesRef.current = hasNextPage;
        setHasMoreMessages(hasNextPage);

        const latestOutgoingWithStatus = loadedMessages.find(
          (message) => message.senderId === currentUserId && !!message.status && message.messageId > 0,
        );
        setVisibleMessageStatus(latestOutgoingWithStatus?.status
          ? { messageId: latestOutgoingWithStatus.messageId, status: latestOutgoingWithStatus.status }
          : null);
        markLatestIncomingSeen(loadedMessages, result.data.conversationId);
      } catch (error) {
        console.error("[Conversation][load-first-error]", error);
      } finally {
        await waitForMinLoading(loadingStartedAt);
        if (activeConversationKeyRef.current === loadKey) {
          setLoadingConversation(false);
        }
      }
    };

    loadMess();
  }, [selectedConversationKey, targetUserId, groupId, isGroupConversation, fallbackConversationId, currentUserId, dispatch, markLatestIncomingSeen]);

  useEffect(() => {
    loadedPrivateProfileIdsRef.current.clear();
    if (!isGroupConversation) {
      setPrivateSenderProfiles({});
    }
  }, [isGroupConversation, selectedConversationKey]);

  useEffect(() => {
    if (!isGroupConversation || !groupId) return;

    let cancelled = false;
    const loadGroupMemberProfiles = async () => {
      const fallbackSenderIds = Array.from(new Set(
        conversation
          .map((message) => message.senderId)
          .filter((senderId) => senderId !== currentUserId)
          .filter((senderId) => Number.isFinite(senderId) && senderId > 0),
      ));

      let memberIds = fallbackSenderIds;
      try {
        const result = await getActiveGroupMemberIds(groupId);
        const activeMemberIds = (result.data || [])
          .map((memberId: number) => Number(memberId))
          .filter((memberId: number) => memberId !== currentUserId)
          .filter((memberId: number) => Number.isFinite(memberId) && memberId > 0);
        if (activeMemberIds.length > 0) {
          memberIds = activeMemberIds;
        }
      } catch (error) {
        console.error("[Conversation][load-group-members-error]", error);
      }

      const missingMemberIds = Array.from(new Set(memberIds))
        .filter((memberId) => !groupMemberProfiles[memberId]);
      if (missingMemberIds.length === 0 || cancelled) return;

      try {
        const profiles = await loadFriendProfilesService(missingMemberIds);
        if (cancelled) return;
        const foundProfileIds = new Set(profiles.map((profile) => profile.userId));
        const fallbackProfiles = missingMemberIds
          .filter((senderId) => !foundProfileIds.has(senderId))
          .map((senderId) => ({
            userId: senderId,
            fullName: `User ${senderId}`,
            avatarUrl: null,
          }));
        dispatch(upsertGroupMemberProfiles([...profiles, ...fallbackProfiles]));
      } catch (error) {
        console.error("[Conversation][load-sender-profiles-error]", error);
      }
    };

    loadGroupMemberProfiles();
    return () => {
      cancelled = true;
    };
  }, [conversation, currentUserId, dispatch, groupId, groupMemberProfiles, isGroupConversation]);

  useEffect(() => {
    if (isGroupConversation) {
      setPrivateSenderProfiles({});
      return;
    }

    const routeProfileId = targetUserId || null;
    if (!routeProfileId || (!routeState?.fullName && !routeAvatar)) return;

    setPrivateSenderProfiles((prev) => ({
      ...prev,
      [routeProfileId]: {
        userId: routeProfileId,
        fullName: routeState?.fullName || prev[routeProfileId]?.fullName || `User ${routeProfileId}`,
        avatarUrl: routeAvatar || prev[routeProfileId]?.avatarUrl || null,
      },
    }));
  }, [isGroupConversation, routeAvatar, routeState?.fullName, targetUserId]);

  useEffect(() => {
    if (isGroupConversation) return;

    const senderIds = Array.from(new Set([
      ...(targetUserId ? [targetUserId] : []),
      ...conversation
        .map((message) => message.senderId)
        .filter((senderId) => senderId !== currentUserId)
        .filter((senderId) => Number.isFinite(senderId) && senderId > 0),
    ]));

    const missingSenderIds = senderIds.filter((senderId) => {
      const profile = privateSenderProfiles[senderId];
      return !loadedPrivateProfileIdsRef.current.has(senderId)
        && (!profile || !profile.fullName || !profile.avatarUrl);
    });
    if (missingSenderIds.length === 0) return;

    let cancelled = false;
    const loadPrivateSenderProfiles = async () => {
      try {
        const profiles = await loadFriendProfilesService(missingSenderIds);
        missingSenderIds.forEach((senderId) => loadedPrivateProfileIdsRef.current.add(senderId));
        if (cancelled || profiles.length === 0) return;
        setPrivateSenderProfiles((prev) => {
          const next = { ...prev };
          profiles.forEach((profile) => {
            next[profile.userId] = {
              ...next[profile.userId],
              ...profile,
              avatarUrl: profile.avatarUrl || next[profile.userId]?.avatarUrl || null,
              fullName: profile.fullName || next[profile.userId]?.fullName || `User ${profile.userId}`,
            };
          });
          return next;
        });
      } catch (error) {
        console.error("[Conversation][load-private-sender-profiles-error]", error);
      }
    };

    void loadPrivateSenderProfiles();
    return () => {
      cancelled = true;
    };
  }, [conversation, currentUserId, isGroupConversation, privateSenderProfiles, targetUserId]);

  const loadOlderMessages = useCallback(async () => {
    if (
      (!targetUserId && !fallbackConversationId && !isGroupConversation) ||
      (isGroupConversation && !groupId) ||
      loadingOlderMessagesRef.current ||
      !hasMoreMessagesRef.current
    ) {
      return;
    }

    const pageToLoad = nextMessagePageRef.current;
    const loadKey = selectedConversationKey;
    const loadingStartedAt = Date.now();
    loadingOlderMessagesRef.current = true;
    setLoadingOlderMessages(true);

    try {
      const result: APIResponse = isGroupConversation
        ? await loadGroupConversation(currentUserId, groupId as number, pageToLoad)
        : targetUserId
          ? await loadConversation(currentUserId, targetUserId, pageToLoad)
          : await loadConversationById(currentUserId, fallbackConversationId as number, pageToLoad);
      if (activeConversationKeyRef.current !== loadKey) return;

      const olderMessages = (result.data?.listMess || []) as MessageInterface[];
      setConversation((prev) => {
        const existedMessageIds = new Set(prev.map((message) => message.messageId));
        const uniqueOlderMessages = olderMessages.filter((message) => !existedMessageIds.has(message.messageId));
        return [...prev, ...uniqueOlderMessages];
      });

      nextMessagePageRef.current = pageToLoad + 1;
      const hasNextPage = olderMessages.length === MESSAGE_PAGE_SIZE;
      hasMoreMessagesRef.current = hasNextPage;
      setHasMoreMessages(hasNextPage);
    } catch (error) {
      console.error("[Conversation][load-old-error]", error);
    } finally {
      await waitForMinLoading(loadingStartedAt);
      loadingOlderMessagesRef.current = false;
      setLoadingOlderMessages(false);
    }
  }, [
    currentUserId,
    fallbackConversationId,
    groupId,
    isGroupConversation,
    selectedConversationKey,
    targetUserId,
  ]);

  const updateOutgoingMessageStatus = useCallback((
    messageIds: number[],
    status: MessageInterface["status"],
    shouldResolvePendingIds = false,
  ) => {
    if (!status) return;

    setConversation((prev) => {
      const pendingIds = [...pendingTempMessageIds.current];
      const tempIdToRealId = new Map<number, number>();
      const statusMessageIds = new Set<number>();
      const latestStatusMessageId = messageIds.length > 0 ? Math.max(...messageIds) : null;

      if (shouldResolvePendingIds) {
        messageIds.forEach((messageId) => {
          const alreadyExists = prev.some((message) => message.messageId === messageId);
          if (!alreadyExists && pendingIds.length > 0) {
            const tempMessageId = pendingIds.shift() as number;
            tempIdToRealId.set(tempMessageId, messageId);
            statusMessageIds.add(messageId);
          }
        });
      }

      const next = prev.map((message) => {
        const isOutgoing = message.senderId === currentUserId;
        const isExplicitStatusMessage = messageIds.includes(message.messageId);
        const isSeenBeforeLatest =
          status === "SEEN" &&
          latestStatusMessageId !== null &&
          message.messageId > 0 &&
          message.messageId <= latestStatusMessageId;

        if (isOutgoing && (isExplicitStatusMessage || isSeenBeforeLatest)) {
          statusMessageIds.add(message.messageId);
          return shouldApplyStatus(message.status, status) ? { ...message, status } : message;
        }

        const realMessageId = tempIdToRealId.get(message.messageId);
        if (realMessageId) {
          const nextStatus = shouldApplyStatus(message.status, status) ? status : message.status;
          return { ...message, messageId: realMessageId, status: nextStatus };
        }

        return message;
      });

      pendingTempMessageIds.current = pendingIds;
      const visibleStatusMessageId = statusMessageIds.size > 0
        ? Math.max(...Array.from(statusMessageIds))
        : null;
      if (visibleStatusMessageId !== null) {
        setVisibleStatusIfNewer(visibleStatusMessageId, status);
      }
      return next;
    });
  }, [currentUserId, setVisibleStatusIfNewer]);

  const applyMessageAck = useCallback((savedMessage: MessageInterface) => {
    setConversation((prev) => {
      const existingMessage = prev.some((message) => message.messageId === savedMessage.messageId);
      const pendingMessageId = pendingTempMessageIds.current.find((id) =>
        prev.some((message) => message.messageId === id),
      );
      const matchingTempMessage = prev.find((message) =>
        message.messageId < 0 &&
        message.senderId === savedMessage.senderId &&
        message.type === savedMessage.type &&
        (message.content || "") === (savedMessage.content || ""),
      );
      const tempMessageIdToReplace = pendingMessageId ?? matchingTempMessage?.messageId;

      if (existingMessage) {
        pendingTempMessageIds.current = pendingTempMessageIds.current.filter((id) => id !== tempMessageIdToReplace);
        return prev
          .filter((message) => message.messageId >= 0 || message.messageId !== tempMessageIdToReplace)
          .map((message) => message.messageId === savedMessage.messageId
            ? { ...message, ...savedMessage, status: message.status || "SENT" }
            : message);
      }

      if (tempMessageIdToReplace !== undefined) {
        pendingTempMessageIds.current = pendingTempMessageIds.current.filter((id) => id !== tempMessageIdToReplace);
        setVisibleStatusIfNewer(savedMessage.messageId, "SENT");
        return prev.map((message) => message.messageId === tempMessageIdToReplace
          ? { ...message, ...savedMessage, status: "SENT" }
          : message);
      }

      return savedMessage.senderId === currentUserId ? prev : [savedMessage, ...prev];
    });
  }, [currentUserId, setVisibleStatusIfNewer]);

  useEffect(() => {
    const latestOutgoingWithStatus = conversation.find(
      (message) => message.senderId === currentUserId && !!message.status,
    );
    if (!latestOutgoingWithStatus?.status) {
      setVisibleMessageStatus(null);
      return;
    }
    setVisibleStatusIfNewer(latestOutgoingWithStatus.messageId, latestOutgoingWithStatus.status);
  }, [conversation, currentUserId, setVisibleStatusIfNewer]);

  useEffect(() => {
    if (!storeNewMess?.data) return;

    // Allow processing socket events when either the event's conversationId matches
    // the current conversation, OR the payload's message belongs to the current
    // conversation (covers cases where the server may send null/incorrect conversationId).
    const socketConvoId = Number((storeNewMess.data as any).conversationId);
    const socketMessage = (storeNewMess.data as any).message;
    const socketMessageId = Number(socketMessage?.messageId ?? socketMessage?.messageID ?? NaN);
    const belongsToCurrentConversation =
      socketConvoId === conversationId.current ||
      (Number.isFinite(socketMessageId) && conversationRef.current.some((m) => m.messageId === socketMessageId));
    if (!belongsToCurrentConversation) return;

    if (storeEvent === SocketEvent.MESSAGE_ACK && isSocketData(storeNewMess.data)) {
      applyMessageAck(storeNewMess.data.message);
      setMessageText("");
    }

    if (storeEvent === SocketEvent.MESSAGE_RECALL && isSocketData(storeNewMess.data)) {
      const recalledMessage = storeNewMess.data.message;
      setConversation((prev) =>
        prev.map((item) =>
          item.messageId === recalledMessage.messageId ? recalledMessage : item,
        ),
      );
    }

    if (storeEvent === SocketEvent.MESSAGE_MODERATED && isSocketData(storeNewMess.data)) {
      const moderatedMessage = storeNewMess.data.message as any;
      const moderatedMessageId = Number(moderatedMessage?.messageId ?? moderatedMessage?.messageID ?? NaN);
      console.debug('[Conversation][MESSAGE_MODERATED][recv]', { moderatedMessage, moderatedMessageId, conversationId: conversationId.current });
      setConversation((prev) => {
        let found = false;
        const next = prev.map((item) => {
          if (item.messageId === moderatedMessageId) {
            found = true;
            return {
              ...item,
              ...moderatedMessage,
              moderationStatus: moderatedMessage.moderationStatus,
            };
          }
          return item;
        });
        if (!found) {
          console.debug('[Conversation][MESSAGE_MODERATED][not-found] message not in current conversation', { moderatedMessageId });
        }
        return next;
      });
    }

    if (
      (storeEvent === SocketEvent.MESSAGE_PIN || storeEvent === SocketEvent.MESSAGE_UNPIN) &&
      isSocketData(storeNewMess.data)
    ) {
      const updatedMessage = storeNewMess.data.message;
      setConversation((prev) =>
        prev.map((item) =>
          item.messageId === updatedMessage.messageId
            ? {
              ...item,
              ...updatedMessage,
              isPinned: isMessagePinned(updatedMessage),
              pinned: isMessagePinned(updatedMessage),
            }
            : item,
        ),
      );
    }
  }, [storeNewMess, storeEvent, applyMessageAck]);

  useEffect(() => {
    if (!storeNewMess?.data) return;

    const socketConvoId = Number((storeNewMess.data as any).conversationId);
    const socketMessage = (storeNewMess.data as any).message;
    const socketMessageId = Number(socketMessage?.messageId ?? socketMessage?.messageID ?? NaN);
    const belongsToCurrentConversation =
      socketConvoId === conversationId.current ||
      (Number.isFinite(socketMessageId) && conversationRef.current.some((m) => m.messageId === socketMessageId));
    if (!belongsToCurrentConversation) return;

    if (storeEvent === SocketEvent.NEW_MESSAGE && isSocketData(storeNewMess.data)) {
      const incomingMessage = storeNewMess.data.message as any;
      const incomingMessageId = Number(incomingMessage?.messageId ?? incomingMessage?.messageID ?? NaN);
      const normalizedIncoming = { ...incomingMessage, messageId: incomingMessageId } as MessageInterface;
      setConversation((prev) => {
        if (prev.some((item) => item.messageId === incomingMessageId)) {
          return prev;
        }
        return [normalizedIncoming, ...prev];
      });

      if (incomingMessage.senderId !== currentUserId) {
        if (document.visibilityState === "visible") {
          markLatestIncomingSeen([...conversation, incomingMessage], storeNewMess.data.conversationId);
        } else {
          dispatch(increaseUnread({ conversationId: storeNewMess.data.conversationId }));
        }
      }
    }

    if (
      (
        storeEvent === SocketEvent.MESSAGE_SENT ||
        storeEvent === SocketEvent.MESSAGE_DELIVERED ||
        storeEvent === SocketEvent.MESSAGE_SEEN
      ) &&
      isMessageStatusData(storeNewMess.data)
    ) {
      updateOutgoingMessageStatus(
        storeNewMess.data.messageIds,
        storeNewMess.data.status,
        storeEvent === SocketEvent.MESSAGE_SENT,
      );
      if (storeEvent === SocketEvent.MESSAGE_SEEN) {
        dispatch(clearUnread({ conversationId: storeNewMess.data.conversationId }));
      }
    }

    if (
      (storeEvent === SocketEvent.REACTION_ADD || storeEvent === SocketEvent.REACTION_ACK) &&
      isReactionData(storeNewMess.data) &&
      storeNewMess.data.message
    ) {
      const reactionMessageId = Number(storeNewMess.data.message.messageId ?? storeNewMess.data.message.messageID);
      if (Number.isFinite(reactionMessageId) && reactionMessageId > 0) {
        const reaction: ReactionDTO = {
          ...storeNewMess.data.message,
          messageId: reactionMessageId,
        };
        setConversation((prev) => prev.map((message) => {
          if (message.messageId !== reactionMessageId) {
            return message;
          }
          const reactions = message.reactions || [];
          const senderId = reaction.senderId;
          const nextReactions =
            senderId === undefined || senderId === null
              ? [...reactions, reaction]
              : reactions.some((item) => item.senderId === senderId)
                ? reactions.map((item) => item.senderId === senderId ? reaction : item)
                : [...reactions, reaction];
          return { ...message, reactions: nextReactions };
        }));
      }
    }

    if (storeEvent === SocketEvent.CONVERSATION_COLOR_CHANGED) {
      const data = storeNewMess.data as any;
      if (data && data.conversationId === conversationId.current && data.color) {
        setThemeId(data.color);
      }
    }

    if (storeEvent === SocketEvent.VIDEO_CALL_ENDED) {
      setWaitingVideoCall(null);
    }

    if (storeEvent === SocketEvent.VIDEO_CALL_ACCEPTED || storeEvent === SocketEvent.VIDEO_CALL_REJECTED) {
      setWaitingVideoCall(null);
      if (storeEvent === SocketEvent.VIDEO_CALL_REJECTED) {
        setRejectedVideoCall(true);
      }
    }
  }, [storeNewMess, storeEvent, currentUserId, dispatch, conversation, markLatestIncomingSeen, updateOutgoingMessageStatus]);

  useEffect(() => {
    const markCurrentConversationSeen = () => {
      markLatestIncomingSeen(conversation, conversationId.current);
    };

    markCurrentConversationSeen();
    document.addEventListener("visibilitychange", markCurrentConversationSeen);
    return () => document.removeEventListener("visibilitychange", markCurrentConversationSeen);
  }, [conversation, markLatestIncomingSeen]);

  const ensureConversationIdBeforeSend = async () => {
    if (conversationId.current) {
      return conversationId.current;
    }

    try {
      const result: APIResponse | null = isGroupConversation
        ? await loadGroupConversation(currentUserId, groupId as number, 0)
        : targetUserId
          ? await loadConversation(currentUserId, targetUserId, 0)
          : fallbackConversationId
            ? await loadConversationById(currentUserId, fallbackConversationId, 0)
            : null;

      const loadedConversationId = result?.data?.conversationId;
      if (!loadedConversationId) {
        return null;
      }

      conversationId.current = Number(loadedConversationId);
      dispatch(updateCurrentConverId({ currentConversationId: Number(loadedConversationId) }));
      
      if (result.data?.color) {
        setThemeId(result.data.color);
      } else {
        setThemeId("default");
      }

      if (Array.isArray(result.data.listMess)) {
        setConversation(result.data.listMess as MessageInterface[]);
      }

      return conversationId.current;
    } catch (error) {
      console.error("[Conversation][ensure-before-send-error]", error);
      return null;
    }
  };

  const markMessageDeletedLocally = useCallback((messageId: number) => {
    setConversation((prev) => prev.map((message) => {
      if (message.messageId !== messageId) {
        return message;
      }
      return {
        ...message,
        content: "",
        mediaURL: null,
        fileName: null,
        isDeleted: true,
        reactions: [],
      };
    }));
  }, []);

  const handleRecallMessage = useCallback((messageId: number) => {
    if (!conversationId.current) return;

    markMessageDeletedLocally(messageId);
    if (messageId < 0) {
      pendingTempMessageIds.current = pendingTempMessageIds.current.filter((id) => id !== messageId);
      return;
    }

    recallMess(conversationId.current, messageId);
  }, [markMessageDeletedLocally]);

  const updateMessagePinnedLocally = useCallback((messageId: number, pinned: boolean) => {
    setConversation((prev) => prev.map((message) => {
      if (message.messageId !== messageId) {
        return message;
      }
      return {
        ...message,
        isPinned: pinned,
        pinned,
      };
    }));
  }, []);

  const handlePinMessage = useCallback((message: MessageInterface, pinned: boolean) => {
    if (!conversationId.current || message.messageId <= 0) return;

    const previousPinned = isMessagePinned(message);
    updateMessagePinnedLocally(message.messageId, pinned);

    setMessagePinned(conversationId.current, message.messageId, pinned)
      .then((updatedMessage: any) => {
        if (!updatedMessage || typeof updatedMessage !== "object") return;
        setConversation((prev) => prev.map((item) =>
          item.messageId === message.messageId
            ? { 
              ...item, 
              pinned: updatedMessage.pinned ?? pinned, 
              isPinned: updatedMessage.pinned ?? pinned 
            }
            : item
        ));
      })
      .catch((error: any) => {
        console.error("[Conversation][pin-message-error]", error);
        updateMessagePinnedLocally(message.messageId, previousPinned);
        alert(pinned ? "Không thể ghim tin nhắn" : "Không thể bỏ ghim tin nhắn");
      });
  }, [updateMessagePinnedLocally]);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleOpenDocument = () => {
    documentInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Chi duoc chon anh hoac video");
      return;
    }
    if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
      alert("Video khong duoc vuot qua 50MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    event.target.value = "";
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("File không được vượt quá 25MB");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    event.target.value = "";
  };

  const getReplyBarText = (message: MessageInterface) => {
    if (isPolicyViolationMessage(message)) return "Tin nhắn bị vi phạm chính sách";
    if (message.isDeleted) return "Tin nhắn đã được thu hồi";
    if (message.content) return message.content;
    if (message.fileName) return message.fileName;
    if (message.mediaURL) return message.type?.startsWith("video/") ? "Video" : "Hình ảnh";
    return "Tin nhắn";
  };

  const sendMessage = async () => {
    if (messageText.trim().length === 0 && !preview && !selectedFile) return;

    // if (messageText.trim().length > 0 && hasBadWords(messageText)) {
    // if (messageText.trim().length > 0) {
    //   setBadWordsWarningOpen(true);
    //   return;
    // }

    const activeConversationId = await ensureConversationIdBeforeSend();
    if (!activeConversationId) return;

    if (!preview && !selectedFile) {
      const tempMessageId = nextTempMessageId.current--;
      const content = messageText;
      pendingTempMessageIds.current.push(tempMessageId);
      setVisibleStatusIfNewer(tempMessageId, "SENDING");
      setConversation((prev) => [{
        messageId: tempMessageId,
        senderId: currentUserId,
        type: "text",
        content,
        mediaURL: null,
        fileName: null,
        createdAt: new Date().toISOString(),
        status: "SENDING",
        replyToMessageId: replymess?.messageId ?? null,
        replyToSenderId: replymess?.senderId ?? null,
        replyToType: replymess?.type ?? null,
        replyToContent: replymess?.content ?? null,
        replyToMediaURL: replymess?.mediaURL ?? null,
        replyToFileName: replymess?.fileName ?? null,
        replyToDeleted: replymess?.isDeleted ?? null,
      }, ...prev]);
      setMessageText("");

      if (replymess) {
        replyText(content, replymess.messageId, "text", activeConversationId);
        setReplyMess(null);
      } else {
        sendText(content, activeConversationId);
      }
      return;
    }

    if (!selectedFile) return;

    const tempMessageId = nextTempMessageId.current--;
    pendingTempMessageIds.current.push(tempMessageId);
    setVisibleStatusIfNewer(tempMessageId, "SENDING");
    setConversation((prev) => [{
      messageId: tempMessageId,
      senderId: currentUserId,
      type: selectedFile.type || "application/octet-stream",
      content: messageText,
      mediaURL: preview,
      fileName: selectedFile.name,
      createdAt: new Date().toISOString(),
      status: "SENDING",
    }, ...prev]);
    setPreview(null);
    setSelectedFile(null);
    setMessageText("");
    uploadMedia(String(activeConversationId), selectedFile, messageText);
  };

  const handleSelectTheme = async (newThemeId: string) => {
    if (!conversationId.current) return;
    try {
      await updateConversationColor(conversationId.current, newThemeId);
      setThemeId(newThemeId);
    } catch (error) {
      console.error("Failed to update theme", error);
    }
  };

  const handleStartCall = useCallback(async (callType: "AUDIO" | "VIDEO" = "AUDIO") => {
    if (!conversationId.current || videoCallLoading) return;

    setVideoCallLoading(true);
    try {
      const call = await startVideoCall(
        conversationId.current,
        currentUser.username || `User ${currentUserId}`,
        currentUser.avatar,
        callType,
      );
      setRejectedVideoCall(false);
      setWaitingVideoCall({
        ...call,
        isGroupCall: isGroupConversation,
        groupId: isGroupConversation ? groupId : call.groupId,
        groupName: isGroupConversation ? callTargetName : call.groupName,
        conversationType: isGroupConversation ? 0 : call.conversationType,
      });
      localStorage.setItem(`videoCallPeer:${call.sessionId}`, JSON.stringify({
        userId: isGroupConversation ? null : targetUserId,
        fullName: callTargetName,
        avatar: callTargetAvatar,
        isGroupCall: isGroupConversation,
      }));
    } catch (error) {
      console.error("[Conversation][start-call-error]", error);
      alert(error instanceof Error ? error.message : "Khong the bat dau cuoc goi");
    } finally {
      setVideoCallLoading(false);
    }
  }, [
    callTargetAvatar,
    callTargetName,
    currentUser.avatar,
    currentUser.username,
    currentUserId,
    groupId,
    isGroupConversation,
    targetUserId,
    videoCallLoading,
  ]);

  const handleCancelWaitingCall = async () => {
    if (!waitingVideoCall || cancelCallLoading) return;

    setCancelCallLoading(true);
    try {
      await rejectVideoCall(waitingVideoCall.sessionId);
      setWaitingVideoCall(null);
    } catch (error) {
      console.error("[Conversation][cancel-call-error]", error);
      alert(error instanceof Error ? error.message : "Khong the huy cuoc goi");
    } finally {
      setCancelCallLoading(false);
    }
  };

  const currentTheme = getThemeById(themeId);

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 73px)",
        minHeight: 0,
        bgcolor: "#f4f6fb",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "75%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          bgcolor: currentTheme.background || "#eef1f8",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 64,
            flexShrink: 0,
            width: "100%",
            px: 2.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Avatar src={avatar || undefined} sx={{ width: 44, height: 44, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontWeight: 750, fontSize: 16.5, color: "#111827", lineHeight: 1.25 }} noWrap>
                {fullName}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#7f735e", lineHeight: 1.3 }}>
                Dang hoat dong
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton disabled={videoCallLoading} onClick={() => handleStartCall("AUDIO")} sx={{ color: "rgb(55, 145, 250)", p: 0.85 }}>
              <CallIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton disabled={videoCallLoading} onClick={() => handleStartCall("VIDEO")} sx={{ color: "rgb(55, 145, 250)", p: 0.85 }}>
              <VideocamIcon sx={{ fontSize: 23 }} />
            </IconButton>
            <IconButton onClick={() => setIsColorPickerOpen(true)} sx={{ color: "rgb(55, 145, 250)", p: 0.85 }}>
              <PaletteIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton onClick={() => isGroupConversation ? setGroupInfoOpen(true) : {}} sx={{ color: "rgb(55, 145, 250)", p: 0.85 }}>
              <InfoIcon sx={{ fontSize: 23 }} />
            </IconButton>
          </Box>
        </Box>

        {(
          <Box
            component="button"
            type="button"
            onClick={() => {
              setGroupInfoTab(isGroupConversation ? "schedule" : "pinned");
              setGroupInfoOpen(true);
            }}
            sx={{
              height: 44,
              flexShrink: 0,
              width: "100%",
              px: 2.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              border: 0,
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              bgcolor: "#fbfcff",
              cursor: "pointer",
              textAlign: "left",
              transition: "background-color 120ms ease, box-shadow 120ms ease",
              "&:hover": {
                bgcolor: "#f3f7ff",
                boxShadow: "inset 3px 0 0 #3b82f6",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isGroupConversation ? "#eff6ff" : "#fff7ed",
                  color: isGroupConversation ? "#2563eb" : "#f97316",
                  flexShrink: 0,
                }}
              >
                {isGroupConversation ? <CalendarMonthIcon sx={{ fontSize: 17 }} /> : <PushPinIcon sx={{ fontSize: 17 }} />}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 750, color: "#1e293b", lineHeight: 1.15 }}>
                  {isGroupConversation ? "Lịch học nhóm" : "Tin nhắn đã ghim"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.25 }} noWrap>
                  {isGroupConversation
                    ? groupSessions.length > 0
                      ? `${groupSessions.length} lịch học - ${pinnedMessages.length} tin ghim`
                      : `Xem lịch học và ${pinnedMessages.length} tin nhắn đã ghim`
                    : `${pinnedMessages.length} tin nhắn đã ghim`}
                </Typography>
              </Box>
            </Box>
            <MoreHorizIcon sx={{ color: "#475569", fontSize: 22, flexShrink: 0 }} />
          </Box>
        )}

        {loadingConversation ? (
          <ConversationLoading />
        ) : conversation.length > 0 ? (
          <ListMess
            theme={currentTheme}
            conversation={conversation}
            setReplyMess={setReplyMess}
            visibleMessageStatus={visibleMessageStatus}
            onCallAgain={handleStartCall}
            onLoadOlderMessages={loadOlderMessages}
            loadingOlderMessages={loadingOlderMessages}
            hasMoreMessages={hasMoreMessages}
            onRecallMessage={handleRecallMessage}
            onForwardMessage={setForwardMess}
            onPinMessage={handlePinMessage}
            isGroupConversation={isGroupConversation}
            senderProfiles={isGroupConversation ? groupMemberProfiles : privateSenderProfiles}
          />
        ) : (
          <WelcomeConversation />
        )}

        {replymess && (
          <ReplyMessage
            fullName={replymess.senderId === currentUserId ? "chính mình" : fullName}
            mess={getReplyBarText(replymess)}
            setReplyMess={setReplyMess}
          />
        )}

        <Box sx={{ width: "100%", bgcolor: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          {preview && (
            <Box sx={{ px: 2, pt: 1.5, pb: 1, bgcolor: "#fff" }}>
              <Box
                sx={{
                  position: "relative",
                  width: selectedFile?.type.startsWith("image/") || selectedFile?.type.startsWith("video/") ? 60 : "min(320px, 100%)",
                  height: selectedFile?.type.startsWith("image/") || selectedFile?.type.startsWith("video/") ? 60 : 56,
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#f8fafc",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {selectedFile?.type.startsWith("video/") ? (
                  <Box
                    component="video"
                    src={preview}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", bgcolor: "#000" }}
                    preload="metadata"
                    muted
                  />
                ) : selectedFile?.type.startsWith("image/") ? (
                  <Box
                    component="img"
                    src={preview}
                    alt="preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : selectedFile ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, px: 1.25, pr: 4.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: "#fee2e2",
                        color: "#a40000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <InsertDriveFileIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }} noWrap>
                        {selectedFile.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 26,
                    height: 26,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                  }}
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                >
                  <CancelPresentationIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 1.5,
              px: 2,
              py: 1,
              bgcolor: "#fff",
              zIndex: 1,
            }}
          >
            <IconButton sx={{ color: "#a40000", p: 0.5 }}>
              <MicIcon />
            </IconButton>

            <IconButton sx={{ color: "#a40000", p: 0.5 }} onClick={handleOpenFile}>
              <ImageIcon />
            </IconButton>

            <IconButton sx={{ color: "#a40000", p: 0.5 }} onClick={handleOpenDocument}>
              <AttachFileIcon />
            </IconButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <input
              ref={documentInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleDocumentChange}
            />

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                bgcolor: "#f6e3de",
              }}
            >
              <InputBase
                placeholder="Aa"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{ flex: 1, fontSize: 16, color: "#6b6b6b" }}
              />

              <Box ref={emojiPickerRef} sx={{ position: "relative", flexShrink: 0 }}>
                {showEmojiPicker && (
                  <Box
                    sx={{
                      position: "absolute",
                      right: 0,
                      bottom: "calc(100% + 12px)",
                      zIndex: 10,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </Box>
                )}

                <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)} sx={{ color: "#a40000", p: 0.5 }}>
                  <SentimentSatisfiedAltIcon />
                </IconButton>
              </Box>
            </Paper>

            <IconButton
              onClick={sendMessage}
              sx={{
                bgcolor: "#a40000",
                color: "#fff",
                p: 1.2,
                "&:hover": { bgcolor: "#8a0000" },
                flexShrink: 0,
              }}
            >
              <SendIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <ListFriends />
      <ForwardMessageModal
        open={!!forwardmess}
        message={forwardmess}
        currentUserId={currentUserId}
        onClose={() => setForwardMess(null)}
      />
      <VideoCallModal
        open={!!waitingVideoCall}
        mode="outgoing"
        name={callTargetName}
        avatar={callTargetAvatar}
        callType={waitingVideoCall?.callType}
        loading={cancelCallLoading}
        onReject={handleCancelWaitingCall}
      />
      <VideoCallModal
        open={rejectedVideoCall}
        mode="rejected"
        name={callTargetName}
        avatar={callTargetAvatar}
        callType="AUDIO"
        onReject={() => setRejectedVideoCall(false)}
      />
      <Dialog
        open={groupInfoOpen}
        onClose={() => setGroupInfoOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {fullName}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.25 }}>
            {isGroupConversation ? "Lịch học nhóm và tin nhắn đã ghim" : "Tin nhắn đã ghim trong cuộc trò chuyện"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: "flex", borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
            {(isGroupConversation ? [
              { id: "schedule" as const, label: "Lịch học", icon: <CalendarMonthIcon sx={{ fontSize: 18 }} /> },
              { id: "pinned" as const, label: "Tin ghim", icon: <PushPinIcon sx={{ fontSize: 18 }} /> },
            ] : [
              { id: "pinned" as const, label: "Tin ghim", icon: <PushPinIcon sx={{ fontSize: 18 }} /> },
            ]).map((tab) => {
              const active = groupInfoTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  startIcon={tab.icon}
                  onClick={() => setGroupInfoTab(tab.id)}
                  sx={{
                    flex: 1,
                    py: 1.35,
                    borderRadius: 0,
                    textTransform: "none",
                    fontWeight: 700,
                    color: active ? "#1d4ed8" : "#475569",
                    bgcolor: active ? "#fff" : "transparent",
                    borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                    "&:hover": { bgcolor: active ? "#fff" : "#eef2ff" },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ maxHeight: "min(560px, calc(100vh - 220px))", overflowY: "auto", p: 2.5, bgcolor: "#fff" }}>
            {isGroupConversation && groupInfoTab === "schedule" && (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {groupSessionsLoading && (
                  <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={30} />
                  </Box>
                )}

                {!groupSessionsLoading && groupSessionsError && (
                  <Box sx={{ border: "1px solid #fecaca", bgcolor: "#fef2f2", color: "#b91c1c", borderRadius: 2, p: 2, fontSize: 14 }}>
                    {groupSessionsError}
                  </Box>
                )}

                {!groupSessionsLoading && !groupSessionsError && groupSessions.length === 0 && (
                  <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 3, textAlign: "center", color: "#64748b" }}>
                    Nhóm chưa có lịch học nào.
                  </Box>
                )}

                {!groupSessionsLoading && groupSessions.map((session) => (
                  <Box
                    key={session.id}
                    sx={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      p: 2,
                      bgcolor: "#fff",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                          {session.title}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
                          {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          px: 1,
                          py: 0.4,
                          borderRadius: 1,
                          bgcolor: session.status === "CANCELLED" ? "#fef2f2" : "#eff6ff",
                          color: session.status === "CANCELLED" ? "#b91c1c" : "#1d4ed8",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {sessionStatusLabel[session.status] || session.status}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                      <Typography sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "#f1f5f9", color: "#334155", fontSize: 12, fontWeight: 700 }}>
                        {studyModeLabel[session.studyMode] || session.studyMode}
                      </Typography>
                      {session.subjectName && (
                        <Typography sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "#fff7ed", color: "#c2410c", fontSize: 12, fontWeight: 700 }}>
                          {session.subjectName}
                        </Typography>
                      )}
                      {session.membersCount !== null && session.membersCount !== undefined && (
                        <Typography sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: "#ecfdf5", color: "#047857", fontSize: 12, fontWeight: 700 }}>
                          {session.membersCount} thành viên
                        </Typography>
                      )}
                    </Box>

                    {(session.location || session.meetingUrl || session.description) && (
                      <Box sx={{ mt: 1.5, color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
                        {session.location && <Typography sx={{ fontSize: 13 }}>Địa điểm: {session.location}</Typography>}
                        {session.meetingUrl && <Typography sx={{ fontSize: 13 }}>Link học: {session.meetingUrl}</Typography>}
                        {session.description && <Typography sx={{ fontSize: 13 }}>Ghi chú: {session.description}</Typography>}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {groupInfoTab === "pinned" && (
              <Box sx={{ display: "grid", gap: 1.25 }}>
                {pinnedMessages.length === 0 ? (
                  <Box sx={{ border: "1px dashed #cbd5e1", borderRadius: 2, p: 3, textAlign: "center", color: "#64748b" }}>
                    Chưa có tin nhắn nào được ghim.
                  </Box>
                ) : (
                  pinnedMessages.map((message) => (
                    <Box
                      key={message.messageId}
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        p: 1.5,
                        display: "flex",
                        gap: 1.25,
                        alignItems: "flex-start",
                      }}
                    >
                      <PushPinIcon sx={{ color: "#f97316", fontSize: 19, mt: 0.25 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: "#0f172a", fontSize: 14, fontWeight: 700 }}>
                          {getMessagePreview(message)}
                        </Typography>
                        <Typography sx={{ color: "#334155", fontSize: 12.5, mt: 0.35, fontWeight: 700 }}>
                          {getPinnedSenderName(message)}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: 12, mt: 0.35 }}>
                          {message.createdAt ? formatDateTime(message.createdAt) : "Tin nhắn"}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => handlePinMessage(message, false)}
                        sx={{
                          alignSelf: "center",
                          flexShrink: 0,
                          color: "#b91c1c",
                          borderColor: "#fecaca",
                          bgcolor: "#fff",
                          textTransform: "none",
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: "#fca5a5",
                            bgcolor: "#fef2f2",
                          },
                        }}
                        variant="outlined"
                      >
                        Bỏ ghim
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setGroupInfoOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700, color: "#475569" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={badWordsWarningOpen}
        onClose={() => setBadWordsWarningOpen(false)}
        PaperProps={{
          sx: {
            width: "min(420px, calc(100vw - 32px))",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#a40000" }}>
          Nội dung không phù hợp
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#333", lineHeight: 1.6 }}>
            Tin nhắn của bạn có chứa từ ngữ xúc phạm. Vui lòng chỉnh sửa nội dung trước khi gửi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setBadWordsWarningOpen(false)}
            sx={{
              bgcolor: "#a40000",
              "&:hover": { bgcolor: "#8a0000" },
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>
      {isColorPickerOpen && (
        <ColorPickerModal
          open={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          currentThemeId={themeId}
          onSelectTheme={handleSelectTheme}
        />
      )}
    </Box>
  );
}

