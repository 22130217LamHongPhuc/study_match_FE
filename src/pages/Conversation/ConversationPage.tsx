import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import ImageIcon from "@mui/icons-material/Image";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import {
  Avatar,
  Box,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import WelcomeConversation from "../../components/conversation/WelcomeConversion";
import ListFriends from "../../components/conversation/ListFriends";
import ListMess from "../../components/conversation/ListMess";
import ReplyMessage from "../../components/conversation/ReplyMessage";
import VideoCallModal from "../../components/conversation/VideoCallModal";
import { MessageInterface } from "../../model/Conversation";
import { APIResponse } from "../../model/APIResponse";
import { MessageStatusData, SocketData } from "../../model/SocketResponse";
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
  uploadMedia,
} from "../../services/ChatService";
import { getActiveGroupMemberIds } from "../../services/GroupService";
import { loadFriendProfilesService } from "../../services/FriendService";
import { rejectVideoCall, startVideoCall } from "../../services/VideoCallService";
import { SocketEvent } from "../../enum/SocketEvent";
import { RootState } from "../../redux/store";
import {
  clearUnread,
  increaseUnread,
  updateCurrentConverId,
  upsertGroupMemberProfiles,
} from "../../redux/ChatReducer";

const MESSAGE_PAGE_SIZE = 25;
const MESSAGE_LOADING_MIN_MS = 250;

const waitForMinLoading = async (startedAt: number) => {
  const remainingTime = MESSAGE_LOADING_MIN_MS - (Date.now() - startedAt);
  if (remainingTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
  }
};

type RouteState = {
  conversationKind?: "PRIVATE" | "GROUP";
  conversationType?: number;
  targetUserId?: number | null;
  groupId?: number | null;
  avatar?: string | null;
  fullName?: string | null;
  groupName?: string | null;
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
  const avatar = routeState?.avatar || null;
  const groupName = routeState?.groupName || null;
  const fullName = isGroupConversation
    ? groupName || "Nhom hoc"
    : routeState?.fullName || "Nguoi dung";
  const callTargetName = isGroupConversation ? groupName || "Nhom hoc" : fullName;
  const callTargetAvatar = isGroupConversation ? null : avatar;
  const selectedConversationKey = isGroupConversation
    ? groupId ? `group:${groupId}` : "none"
    : targetUserId
      ? `private:${targetUserId}`
      : fallbackConversationId
        ? `conversation:${fallbackConversationId}`
        : "none";

  const [conversation, setConversation] = useState<MessageInterface[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replymess, setReplyMess] = useState<MessageInterface | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [waitingVideoCall, setWaitingVideoCall] = useState<VideoCallInfo | null>(null);
  const [rejectedVideoCall, setRejectedVideoCall] = useState(false);
  const [cancelCallLoading, setCancelCallLoading] = useState(false);
  const [videoCallLoading, setVideoCallLoading] = useState(false);
  const [visibleMessageStatus, setVisibleMessageStatus] = useState<{
    messageId: number;
    status: MessageInterface["status"];
  } | null>(null);

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

  useLayoutEffect(() => {
    const loadMess = async () => {
      const loadKey = selectedConversationKey;
      activeConversationKeyRef.current = loadKey;

      if (!isGroupConversation && !targetUserId && !fallbackConversationId) {
        setConversation([]);
        conversationId.current = null;
        return;
      }
      if (isGroupConversation && !groupId) {
        setConversation([]);
        conversationId.current = null;
        return;
      }

      nextMessagePageRef.current = 1;
      hasMoreMessagesRef.current = true;
      loadingOlderMessagesRef.current = false;
      lastSeenMessageIdRef.current = null;
      setHasMoreMessages(true);
      setLoadingOlderMessages(false);
      setVisibleMessageStatus(null);
      setConversation([]);

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
      }
    };

    loadMess();
  }, [selectedConversationKey, targetUserId, groupId, isGroupConversation, fallbackConversationId, currentUserId, dispatch, markLatestIncomingSeen]);

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

  const loadOlderMessages = async () => {
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
  };

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
    if (!storeNewMess?.data || conversationId.current !== storeNewMess.data.conversationId) return;

    if (storeEvent === SocketEvent.MESSAGE_ACK && isSocketData(storeNewMess.data)) {
      applyMessageAck(storeNewMess.data.message);
      setFileLoading(false);
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
  }, [storeNewMess, storeEvent, applyMessageAck]);

  useEffect(() => {
    if (!storeNewMess?.data || conversationId.current !== storeNewMess.data.conversationId) return;

    if (storeEvent === SocketEvent.NEW_MESSAGE && isSocketData(storeNewMess.data)) {
      const incomingMessage = storeNewMess.data.message;
      setConversation((prev) => {
        if (prev.some((item) => item.messageId === incomingMessage.messageId)) {
          return prev;
        }
        return [incomingMessage, ...prev];
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
      setFileLoading(false);
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
      if (Array.isArray(result.data.listMess)) {
        setConversation(result.data.listMess as MessageInterface[]);
      }

      return conversationId.current;
    } catch (error) {
      console.error("[Conversation][ensure-before-send-error]", error);
      return null;
    }
  };

  const markMessageDeletedLocally = (messageId: number) => {
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
  };

  const handleRecallMessage = (messageId: number) => {
    if (!conversationId.current) return;

    markMessageDeletedLocally(messageId);
    if (messageId < 0) {
      pendingTempMessageIds.current = pendingTempMessageIds.current.filter((id) => id !== messageId);
      return;
    }

    recallMess(conversationId.current, messageId);
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
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

  const sendMessage = async () => {
    if (messageText.trim().length === 0 && !preview && !selectedFile) return;

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
      }, ...prev]);
      setMessageText("");

      if (replymess) {
        replyText(content, replymess.messageId, "text");
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
      type: selectedFile.type,
      content: messageText,
      mediaURL: preview,
      fileName: selectedFile.name,
      createdAt: new Date().toISOString(),
      status: "SENDING",
    }, ...prev]);
    setPreview(null);
    setFileLoading(true);
    setSelectedFile(null);
    setMessageText("");
    uploadMedia(String(activeConversationId), selectedFile, messageText);
  };

  const handleStartCall = async (callType: "AUDIO" | "VIDEO" = "AUDIO") => {
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
  };

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
          bgcolor: "#eef1f8",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 78,
            flexShrink: 0,
            width: "100%",
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src={avatar || undefined} sx={{ width: 52, height: 52 }} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1f1f1f" }}>
                {fullName}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#7f735e" }}>
                Dang hoat dong
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton disabled={videoCallLoading} onClick={() => handleStartCall("AUDIO")} sx={{ color: "rgb(55, 145, 250)" }}>
              <CallIcon />
            </IconButton>
            <IconButton disabled={videoCallLoading} onClick={() => handleStartCall("VIDEO")} sx={{ color: "rgb(55, 145, 250)" }}>
              <VideocamIcon />
            </IconButton>
          </Box>
        </Box>

        {conversation.length > 0 ? (
          <ListMess
            fileLoading={fileLoading}
            conversation={conversation}
            setReplyMess={setReplyMess}
            visibleMessageStatus={visibleMessageStatus}
            onCallAgain={handleStartCall}
            onLoadOlderMessages={loadOlderMessages}
            loadingOlderMessages={loadingOlderMessages}
            hasMoreMessages={hasMoreMessages}
            onRecallMessage={handleRecallMessage}
            isGroupConversation={isGroupConversation}
            senderProfiles={groupMemberProfiles}
          />
        ) : (
          <WelcomeConversation />
        )}

        {replymess && (
          <ReplyMessage
            fullName={replymess.senderId === currentUserId ? "chinh minh" : fullName}
            mess={replymess.content || ""}
            setReplyMess={setReplyMess}
          />
        )}

        <Box sx={{ width: "100%", bgcolor: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          {preview && (
            <Box sx={{ px: 2, pt: 1.5, pb: 1, bgcolor: "#fff" }}>
              <Box
                sx={{
                  position: "relative",
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "#f3f3f3",
                  border: "1px solid rgba(0,0,0,0.12)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
                ) : (
                  <Box
                    component="img"
                    src={preview}
                    alt="preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
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
    </Box>
  );
}
