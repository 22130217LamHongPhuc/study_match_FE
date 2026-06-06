
import AddIcon from '@mui/icons-material/Add'
import CallIcon from '@mui/icons-material/Call'
import PhoneMissedIcon from '@mui/icons-material/PhoneMissed'
import VideocamIcon from '@mui/icons-material/Videocam'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ReplyIcon from '@mui/icons-material/Reply'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import { Avatar, Box, CircularProgress, IconButton, Tooltip } from '@mui/material'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MessageInterface } from '../../model/Conversation'
import { submitReaction } from '../../services/ReactionService'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { SocketEvent } from '../../enum/SocketEvent'
import { ReactionData, ReactionDTO } from '../../model/Reaction'

type VisibleMessageStatus = {
    messageId: number
    status: MessageInterface["status"]
}

type ListMessProps = {
    conversation: MessageInterface[]
    setReplyMess: React.Dispatch<React.SetStateAction<MessageInterface | null>>
    fileLoading: boolean
    visibleMessageStatus: VisibleMessageStatus | null
    onCallAgain?: (callType: "AUDIO" | "VIDEO") => void
    onLoadOlderMessages?: () => void
    loadingOlderMessages?: boolean
    hasMoreMessages?: boolean
    onRecallMessage?: (messageId: number) => void
    isGroupConversation?: boolean
    senderProfiles?: Record<number, {
        userId?: number
        user_id?: number
        id?: number
        fullName?: string | null
        full_name?: string | null
        name?: string | null
        username?: string | null
        avatarUrl?: string | null
        avatar_url?: string | null
        avatar?: string | null
    }>
}

export default function ListMess({ conversation, setReplyMess, fileLoading, visibleMessageStatus, onCallAgain, onLoadOlderMessages, loadingOlderMessages = false, hasMoreMessages = false, onRecallMessage, isGroupConversation = false, senderProfiles = {} }: ListMessProps) {
    const [activeReactionMessageId, setActiveReactionMessageId] = useState<number | null>(null)
    const [activeMoreMessageId, setActiveMoreMessageId] = useState<number | null>(null)
    const [messageReactions, setMessageReactions] = useState<Record<number, ReactionDTO[]>>({})
    const moreMenuRef = useRef<HTMLDivElement | null>(null)
    const currentUserId = Number(localStorage.getItem("userId"))
    const currentUser = useSelector((state: RootState) => state.user)
    const currentConversationId = useSelector((state: RootState) => state.chat.currentConversationId)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const previousMessageCountRef = useRef(conversation.length)
    const pendingScrollRestoreRef = useRef<{
        scrollHeight: number
        scrollTop: number
    } | null>(null)
    const oldestThresholdReachedRef = useRef(false)

    const reactions = ["\u2764\ufe0f", "\ud83d\ude06", "\ud83d\ude2e", "\ud83d\ude22", "\ud83d\ude21", "\ud83d\udc4d"]
    const moreActions = ["Gỡ", "Chuyển tiếp", "Ghim"]
    const currenConverID = useSelector((state: RootState) => state.chat.currentConversationId)
    const latestOutgoingMessageId = conversation.find((message) => message.senderId === currentUserId)?.messageId ?? null

    const upsertReaction = (current: ReactionDTO[], reaction: ReactionDTO) => {
        const senderId = reaction.senderId
        if (senderId === undefined || senderId === null) {
            return [...current, reaction]
        }
        const exists = current.some((item) => item.senderId === senderId)
        if (!exists) {
            return [...current, reaction]
        }
        return current.map((item) => item.senderId === senderId ? reaction : item)
    }

    const renderReactionBadges = (messageId: number) => {
        const reactionItems = messageReactions[messageId] || []
        const uniqueEmojis = Array.from(new Set(reactionItems.map((reaction) => reaction.emoji).filter(Boolean)))
        return uniqueEmojis
    }

    const getSenderProfile = (senderId: number) => senderProfiles[senderId]

    const getSenderName = (senderId: number) => {
        const profile = getSenderProfile(senderId)
        return profile?.fullName || profile?.full_name || profile?.name || profile?.username || `User ${senderId}`
    }

    const getSenderAvatar = (senderId: number) => {
        const profile = getSenderProfile(senderId)
        return profile?.avatarUrl || profile?.avatar_url || profile?.avatar || undefined
    }

    const getReactionSenderName = (senderId?: number) => {
        if (!senderId) return "Ng\u01b0\u1eddi d\u00f9ng"
        if (senderId === currentUserId) return currentUser.username || "B\u1ea1n"
        return getSenderName(senderId)
    }

    const renderReactionBadge = (messageId: number, horizontal: "left" | "right") => {
        const badgeEmojis = renderReactionBadges(messageId)
        if (badgeEmojis.length === 0) return null

        const reactionItems = messageReactions[messageId] || []
        const badge = (
            <Box
                sx={{
                    position: "absolute",
                    [horizontal]: -8,
                    bottom: -12,
                    minWidth: 22,
                    height: 22,
                    px: 0.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    color: "#202124",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.16)",
                    fontSize: 13,
                    lineHeight: 1,
                    cursor: isGroupConversation ? "default" : "inherit",
                }}
            >
                {badgeEmojis.join("")}
            </Box>
        )

        if (!isGroupConversation) return badge

        return (
            <Tooltip
                arrow
                placement="top"
                title={
                    <Box sx={{ py: 0.25, fontFamily: '"Inter", "Roboto", "Arial", sans-serif' }}>
                        {reactionItems.map((reaction, index) => (
                            <Box
                                key={`${reaction.senderId ?? "unknown"}-${reaction.emoji}-${index}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1.5,
                                    minWidth: 130,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                }}
                            >
                                <Box component="span">{getReactionSenderName(reaction.senderId)}</Box>
                                <Box component="span">{reaction.emoji}</Box>
                            </Box>
                        ))}
                    </Box>
                }
            >
                {badge}
            </Tooltip>
        )
    }

    useEffect(() => {
        const loadedReactions: Record<number, ReactionDTO[]> = {}
        conversation.forEach((message) => {
            if (message.messageId > 0 && message.reactions && message.reactions.length > 0) {
                loadedReactions[message.messageId] = message.reactions
            }
        })
        setMessageReactions((prev) => {
            const currentMessageIds = new Set(conversation.map((message) => message.messageId))
            const next: Record<number, ReactionDTO[]> = {}
            Object.entries(prev).forEach(([messageId, reactions]) => {
                const numericMessageId = Number(messageId)
                if (currentMessageIds.has(numericMessageId)) {
                    next[numericMessageId] = reactions
                }
            })
            Object.entries(loadedReactions).forEach(([messageId, reactions]) => {
                const numericMessageId = Number(messageId)
                next[numericMessageId] = reactions.reduce(
                    (current, reaction) => upsertReaction(current, reaction),
                    next[numericMessageId] || []
                )
            })
            return next
        })
    }, [conversation])

    useLayoutEffect(() => {
        const previousMessageCount = previousMessageCountRef.current
        previousMessageCountRef.current = conversation.length

        const pendingScrollRestore = pendingScrollRestoreRef.current
        const element = scrollContainerRef.current
        if (!pendingScrollRestore || !element || conversation.length <= previousMessageCount) {
            return
        }

        const heightDelta = element.scrollHeight - pendingScrollRestore.scrollHeight
        const nextScrollTop = pendingScrollRestore.scrollTop < 0
            ? pendingScrollRestore.scrollTop
            : pendingScrollRestore.scrollTop + heightDelta
        element.scrollTop = nextScrollTop
        window.requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = nextScrollTop
            }
            pendingScrollRestoreRef.current = null
        })
    }, [conversation.length])

    useEffect(() => {
        if (activeMoreMessageId === null && activeReactionMessageId === null) {
            return
        }
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setActiveMoreMessageId(null)
                setActiveReactionMessageId(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [activeMoreMessageId, activeReactionMessageId])

    const emojjRef = useRef<number>(-10)
    const hanldeClickEmojj = (messageId: number, emojj: string) => {
        emojjRef.current = messageId
        console.log("Clicked emoji:", emojj, "for message ID:", messageId);
        if (!currenConverID) return
        setActiveReactionMessageId(null);
        setMessageReactions((prev) => ({
            ...prev,
            [messageId]: upsertReaction(prev[messageId] || [], {
                messageId,
                senderId: currentUserId,
                emoji: emojj,
            }),
        }));
        setActiveMoreMessageId(null);
        submitReaction(emojj, messageId, currenConverID)
    }
    const store = useSelector((state: RootState) => state.chat.newMess)
    const storeEvent = useSelector((state: RootState) => state.chat.newMess?.event)
    const storeData = useSelector((state: RootState) => state.chat.newMess?.data) as ReactionData | undefined;
    useEffect(() => {
        if (!storeEvent || !storeData || !storeData.message) return
        if (storeEvent === SocketEvent.REACTION_ADD || storeEvent === SocketEvent.REACTION_ACK) {
            console.log("[Reaction][FE][ListMess][receive]", {
                event: storeEvent,
                currentConversationId,
                socketConversationId: storeData.conversationId,
                payload: storeData.message,
                currentMessageIds: conversation.map((message) => message.messageId),
            })
            const reactionMessageId = Number(storeData.message.messageId ?? storeData.message.messageID)
            if (!Number.isFinite(reactionMessageId) || reactionMessageId <= 0) {
                console.log("[Reaction][FE][ListMess][skip-invalid-message-id]", {
                    reactionMessageId,
                    payload: storeData.message,
                })
                return
            }
            const belongsToCurrentConversation =
                storeData.conversationId === null ||
                Number(storeData.conversationId) === Number(currentConversationId) ||
                conversation.some((message) => message.messageId === reactionMessageId)
            if (!belongsToCurrentConversation) {
                console.log("[Reaction][FE][ListMess][skip-wrong-conversation]", {
                    reactionMessageId,
                    currentConversationId,
                    socketConversationId: storeData.conversationId,
                })
                return
            }
            setActiveReactionMessageId(null);
            const reaction = {
                ...storeData.message,
                messageId: reactionMessageId,
            }
            setMessageReactions((prev) => ({
                ...prev,
                [reactionMessageId]: upsertReaction(prev[reactionMessageId] || [], reaction),
            }));
            console.log("[Reaction][FE][ListMess][apply]", {
                reactionMessageId,
                reaction,
            })
            setActiveMoreMessageId(null);
        }

    }, [store, currentConversationId, storeData, storeEvent])
    const clickMoreButton = (action: string, messageId: number) => {
        console.log('nhan vao more nè', action, messageId)
        if (!currentConversationId) return
        if (action === 'Gỡ') {
            onRecallMessage?.(messageId)
        }

    }

    const renderOutgoingStatus = (mess: MessageInterface) => {
        if (!visibleMessageStatus) return null
        const visibleStatusMessageExists = conversation.some(
            (message) => message.messageId === visibleMessageStatus.messageId
        )
        const shouldShowStatus =
            mess.messageId === visibleMessageStatus.messageId ||
            (mess.messageId === latestOutgoingMessageId && !visibleStatusMessageExists)
        if (!shouldShowStatus) return null
        if (!visibleMessageStatus.status) return null

        const statusText = {
            SENDING: "Đang gửi",
            SENT: "Đã gửi",
            DELIVERED: "Đã nhận",
            SEEN: "Đã xem",
        }[visibleMessageStatus.status]

        return (
            <Box
                sx={{
                    mt: 0.35,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: "100%",
                    minHeight: 16,
                    color: "#3f444a",
                    fontSize: 12,
                    lineHeight: 1.2,
                    fontWeight: 600,
                }}
            >
                <Box component="span">{statusText}</Box>
            </Box>
        )
    }

    const renderMessageActions = (mess: MessageInterface, menuPlacement: "left" | "right") => {
        const isActive = activeReactionMessageId === mess.messageId || activeMoreMessageId === mess.messageId

        return (
            <Box
                ref={isActive ? moreMenuRef : undefined}
                className="message-actions"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    mb: 0.25,
                    position: "relative",
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                    transition: "opacity 120ms ease",
                }}
            >
                {activeReactionMessageId === mess.messageId && (
                    <Box
                        sx={{
                            position: "absolute",
                            left: menuPlacement === "right" ? 0 : "auto",
                            right: menuPlacement === "left" ? 0 : "auto",
                            bottom: "calc(100% + 8px)",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.75,
                            bgcolor: "#fff",
                            borderRadius: "999px",
                            boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
                            zIndex: 5,
                        }}
                    >
                        {reactions.map((reaction) => (
                            <Box
                                component="button"
                                key={reaction}
                                type="button"

                                sx={{
                                    width: 34,
                                    height: 34,
                                    p: 0,
                                    border: 0,
                                    cursor: "pointer",
                                    bgcolor: "transparent",
                                    color: "initial",
                                    opacity: 1,
                                    fontSize: 27,
                                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                                    filter: "saturate(1.35) contrast(1.08)",
                                    lineHeight: 1,
                                    "&:hover": {
                                        bgcolor: "#f1f3f4",
                                        transform: "scale(1.12)",
                                    },
                                    transition: "transform 120ms ease, background-color 120ms ease",
                                }}
                                onClick={() => hanldeClickEmojj(mess.messageId, reaction)}
                            >
                                {reaction}
                            </Box>
                        ))}

                    </Box>
                )}
                <IconButton
                    size="small"
                    onClick={() =>
                        setActiveReactionMessageId((prev) =>
                            prev === mess.messageId ? null : mess.messageId
                        )
                    }
                    onMouseDown={() => setActiveMoreMessageId(null)}
                    sx={{ color: "#5f6368", p: 0.2 }}
                >
                    <SentimentSatisfiedAltIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: "#5f6368", p: 0.2 }}
                    onClick={() => {

                        setReplyMess(mess)
                    }}
                >
                    <ReplyIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {
                        setActiveReactionMessageId(null)
                        setActiveMoreMessageId((prev) =>
                            prev === mess.messageId ? null : mess.messageId
                        )
                    }}
                    sx={{
                        color: "#5f6368",
                        p: 0.2,
                        border: "2px solid #1a73e8",
                    }}
                >
                    <MoreVertIcon sx={{ fontSize: 20 }} />
                </IconButton>
                {activeMoreMessageId === mess.messageId && (
                    <Box
                        sx={{
                            position: "absolute",
                            left: menuPlacement === "right" ? "calc(100% + 6px)" : "auto",
                            right: menuPlacement === "left" ? "calc(100% + 6px)" : "auto",
                            top: 0,
                            width: 120,
                            py: 0.25,
                            bgcolor: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
                            zIndex: 6,
                            overflow: "hidden",
                        }}
                    >
                        {moreActions.map((action) => {
                            if (menuPlacement === 'right' && action === 'Gỡ') {
                                return <></>
                            }
                            if (!mess.content && action === 'Gỡ' && mess.type === 'text') {
                                return <></>
                            }
                            return (

                                <Box
                                    component="button"
                                    key={action}
                                    type="button"
                                    onClick={() => {
                                        setActiveMoreMessageId(null)
                                        clickMoreButton(action, mess.messageId)

                                    }}
                                    sx={{
                                        width: "100%",
                                        height: 32,
                                        px: 1.25,
                                        display: "flex",
                                        alignItems: "center",
                                        border: 0,
                                        bgcolor: "#fff",
                                        color: "#111",
                                        cursor: "pointer",
                                        fontSize: 14,
                                        fontWeight: 400,
                                        textAlign: "left",
                                        "&:hover": {
                                            bgcolor: "#f1f3f4",
                                        },
                                        "&:focus-visible": {
                                            outline: "2px solid #1a73e8",
                                            outlineOffset: -2,
                                        },
                                    }}
                                >
                                    {action}
                                </Box>)
                        })}
                    </Box>
                )}
            </Box>
        )
    }

    const isCallMessage = (mess: MessageInterface) => mess.type === "CALL_AUDIO" || mess.type === "CALL_VIDEO"

    const isDeletedMessage = (mess: MessageInterface) => mess.isDeleted || (!mess.content && !mess.mediaURL)

    const renderDeletedMessage = (mess: MessageInterface) => {
        const isMine = mess.senderId === currentUserId
        return (
            <Box
                key={mess.messageId}
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    mb: 1,
                    pl: isMine ? 0 : 4.75,
                }}
            >
                <Box
                    sx={{
                        maxWidth: "70%",
                        px: 2,
                        py: 1,
                        borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        bgcolor: isMine ? "#b30000" : "#fff",
                        color: isMine ? "#fff" : "#5f6368",
                        fontSize: 15,
                        fontStyle: "italic",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                    }}
                >
                    Đã gỡ tin nhắn
                </Box>
            </Box>
        )
    }

    const renderCallHistory = (mess: MessageInterface) => {
        let detail: { status?: string; durationSeconds?: number; callType?: "AUDIO" | "VIDEO" } = {}
        try {
            detail = mess.content ? JSON.parse(mess.content) : {}
        } catch {
            detail = {}
        }

        const callType: "AUDIO" | "VIDEO" = mess.type === "CALL_AUDIO" ? "AUDIO" : "VIDEO"
        const isMissed = detail.status === "MISSED"
        const isMine = mess.senderId === currentUserId
        const duration = Math.max(0, Number(detail.durationSeconds || 0))
        const timeText = mess.createdAt
            ? new Date(mess.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : ""
        const durationText = duration < 60
            ? `${duration} giây`
            : `${Math.ceil(duration / 60)} phút`
        const title = isMissed
            ? `Đã nhỡ cuộc gọi ${callType === "AUDIO" ? "thoại" : "video"}`
            : `Cuộc gọi ${callType === "AUDIO" ? "thoại" : "video"}`
        const subtitle = isMissed ? timeText : durationText
        const Icon = isMissed ? PhoneMissedIcon : callType === "AUDIO" ? CallIcon : VideocamIcon

        return (
            <Box
                key={mess.messageId}
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    mb: 1,
                    pl: isMine ? 0 : 4.75,
                }}
            >
                <Box
                    sx={{
                        width: 250,
                        maxWidth: "min(250px, 78vw)",
                        borderRadius: "18px",
                        bgcolor: "#fff",
                        px: 2,
                        py: 1.35,
                        boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.15 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                bgcolor: isMissed ? "#f43f5e" : "#eeeeee",
                                color: isMissed ? "#fff" : "#111",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Icon sx={{ fontSize: 23 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "#050505",
                                    lineHeight: 1.12,
                                    wordBreak: "break-word",
                                    textTransform: "none",
                                }}
                            >
                                {title}
                            </Box>
                            <Box sx={{ fontSize: 14, color: "#64748b", mt: 0.2 }}>
                                {subtitle}
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => onCallAgain?.(callType)}
                        sx={{
                            mt: 1.15,
                            width: "100%",
                            height: 44,
                            border: 0,
                            borderRadius: "8px",
                            bgcolor: "#f1f1f1",
                            color: "#000",
                            fontSize: 17,
                            fontWeight: 700,
                            textTransform: "none",
                            cursor: "pointer",
                            "&:hover": {
                                bgcolor: "#e7e7e7",
                            },
                        }}
                    >
                        Gọi lại
                    </Box>
                </Box>
            </Box>
        )
    }

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        if (!hasMoreMessages || loadingOlderMessages) return

        const element = event.currentTarget
        const maxScrollDistance = element.scrollHeight - element.clientHeight
        if (maxScrollDistance <= 0) return

        const distanceToOldest = element.scrollTop < 0
            ? maxScrollDistance + element.scrollTop
            : maxScrollDistance - element.scrollTop

        if (distanceToOldest > 96) {
            oldestThresholdReachedRef.current = false
            return
        }

        if (oldestThresholdReachedRef.current) {
            return
        }

        if (distanceToOldest <= 32) {
            oldestThresholdReachedRef.current = true
            pendingScrollRestoreRef.current = {
                scrollHeight: element.scrollHeight,
                scrollTop: element.scrollTop,
            }
            onLoadOlderMessages?.()
        }
    }

    return (
        <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column-reverse",
                overflowY: "auto",
                width: "100%",
                px: 2,
                py: 2,
                position: "relative",
                overflowAnchor: "none",
                background: "linear-gradient(180deg, #f7e19a, #f6885d)",
            }}
        >

            {/* loading của người gửi */}
            {loadingOlderMessages && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 10,
                        left: 16,
                        right: 16,
                        zIndex: 50,
                        px: 1.25,
                        py: 0.85,
                        borderRadius: "999px",
                        bgcolor: "rgba(255,255,255,0.92)",
                        boxShadow: "0 6px 18px rgba(15,23,42,0.14)",
                        pointerEvents: "none",
                    }}
                >
                    <CircularProgress
                        sx={{
                            height: 4,
                            borderRadius: 999,
                            bgcolor: "rgba(255,255,255,0.45)",
                            "& .MuiLinearProgress-bar": {
                                bgcolor: "#b30000",
                            },
                        }}
                    />
                    <Box
                        sx={{
                            mt: 0.45,
                            color: "#5b1111",
                            fontSize: 12,
                            fontWeight: 700,
                            textAlign: "center",
                        }}
                    >
                        Đang tải tin nhắn cũ...
                    </Box>
                </Box>
            )}

            {fileLoading && (<Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                    alignItems: "flex-end",
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        width: 200,
                        height: 150,
                        borderRadius: "18px 18px 4px 18px",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            bgcolor: "rgba(0,0,0,0.25)",
                        }}
                    />

                    <CircularProgress
                        size={34}
                        thickness={4}
                        sx={{
                            color: "#fff",
                            zIndex: 1,
                        }}
                    />
                </Box>
            </Box>)}

            {false && (<>
            {/* mess reply */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                    width: "100%",
                }}
            >
                <Box
                    sx={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                    }}
                >
                    <Box
                        sx={{
                            mb: 0.35,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: 13,
                                color: "#5f6368",
                                mb: 0.35,
                            }}
                        >
                            {"↩ Bạn đã trả lời Nguyen"}
                        </Box>

                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.75,
                                borderRadius: "16px",
                                bgcolor: "#f1f1f1",
                                color: "#5f6368",
                                fontSize: 14,
                                lineHeight: 1.35,
                                wordBreak: "break-word",
                            }}
                        >
                            {"Phòng 5 e"}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            bgcolor: "rgb(179, 0, 0)",
                            color: "#fff",
                            px: 2,
                            py: 1,
                            borderRadius: "18px 18px 4px 18px",
                            fontSize: 15,
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                        }}
                    >
                        {"helo"}
                    </Box>
                </Box>
            </Box>

            </>)}

            {conversation.map((mess: MessageInterface) => {
                if (isCallMessage(mess)) {
                    return renderCallHistory(mess)
                }
                if (isDeletedMessage(mess)) {
                    return renderDeletedMessage(mess)
                }
                if (mess.senderId !== currentUserId) {
                    if (!isGroupConversation) {
                        return (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        mb: 1,
                                        alignItems: "flex-end",
                                        gap: 1,
                                        width: "100%",
                                        "&:hover .message-actions": {
                                            opacity: 1,
                                            pointerEvents: "auto",
                                        },
                                    }} key={mess.messageId}
                                >

                                    <Avatar
                                        src="https://i.pravatar.cc/100?img=12"
                                        sx={{ width: 30, height: 30 }}
                                    />
                                    {
                                        (mess.type === 'text' && mess.content) ?

                                            (<>
                                                <Box
                                                    sx={{
                                                        position: "relative",
                                                        bgcolor: "#fff",
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: "18px 18px 18px 4px",
                                                        maxWidth: "70%",
                                                    }}
                                                >
                                                    {mess.content ? mess.content : 'Tin nháº¯n Ä‘Ã£ Ä‘Æ°á»£c thu há»“i'}
                                                    {renderReactionBadge(mess.messageId, "right")}
                                                </Box>
                                                {renderMessageActions(mess, "right")}
                                            </>) :


                                            (<>
                                                <Box
                                                    sx={{
                                                        display: "flex",

                                                        mb: 1,
                                                        width: "100%",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 240,
                                                            overflow: "hidden",
                                                            borderRadius: "18px 18px 4px 18px",
                                                            bgcolor: "#b30000",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: "100%",
                                                                height: 170,
                                                                overflow: "hidden",
                                                                position: "relative",
                                                                bgcolor: "black",
                                                            }}
                                                        >
                                                            {
                                                                (mess.type === 'video/mp4') ?

                                                                    (<><Box
                                                                        component="video"
                                                                        controls
                                                                        src={mess.mediaURL ? mess.mediaURL : ''}

                                                                        sx={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover",
                                                                            display: "block",
                                                                        }}
                                                                    /></>) :


                                                                    (<><Box
                                                                        component="img"
                                                                        src={mess.mediaURL ? mess.mediaURL : ''}
                                                                        alt="image message"
                                                                        sx={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "cover",
                                                                            display: "block",
                                                                        }}
                                                                    />

                                                                        <Box
                                                                            component="a"
                                                                            href={mess.mediaURL ? mess.mediaURL : ''}
                                                                            target='_blank'
                                                                            download={mess.fileName}
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 8,
                                                                                right: 8,
                                                                                width: 34,
                                                                                height: 34,
                                                                                borderRadius: "50%",
                                                                                bgcolor: "#fff",
                                                                                color: "black",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                textDecoration: "none",
                                                                                fontSize: 18,
                                                                                fontWeight: 700,
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            â†“
                                                                        </Box>
                                                                    </>)
                                                            }




                                                        </Box>

                                                        {
                                                            mess.content && (
                                                                <>
                                                                    <Box
                                                                        sx={{
                                                                            px: 1.5,
                                                                            py: 1,
                                                                            fontSize: 14,
                                                                            lineHeight: 1.4,
                                                                            wordBreak: "break-word",
                                                                        }}
                                                                    >
                                                                        {mess.content}
                                                                    </Box>
                                                                </>
                                                            )
                                                        }


                                                    </Box>
                                                </Box>

                                            </>)
                                    }

                                </Box>

                            </>
                        )
                    }

                    const senderName = getSenderName(mess.senderId)
                    const senderAvatar = getSenderAvatar(mess.senderId)
                    console.log("[GroupMessage][FE][render-sender-profile]", {
                        senderId: mess.senderId,
                        profile: getSenderProfile(mess.senderId),
                        senderName,
                        senderAvatar,
                    })
                    return (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    mb: 1,
                                    alignItems: "flex-start",
                                    gap: 1,
                                    width: "100%",
                                    "&:hover .message-actions": {
                                        opacity: 1,
                                        pointerEvents: "auto",
                                    },
                                }} key={mess.messageId}
                            >

                                <Avatar
                                    src={isGroupConversation ? senderAvatar : "https://i.pravatar.cc/100?img=12"}
                                    sx={{ width: 30, height: 30, mt: "18px" }}
                                >
                                    {isGroupConversation ? senderName.charAt(0).toUpperCase() : undefined}
                                </Avatar>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", maxWidth: "70%" }}>
                                    {isGroupConversation && (
                                        <Box
                                            sx={{
                                                ml: 1,
                                                mb: 0.3,
                                                color: "#5f4638",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                lineHeight: "16px",
                                                minHeight: 16,
                                            }}
                                        >
                                            {senderName}
                                        </Box>
                                    )}
                                {
                                    (mess.type === 'text' && mess.content) ?

                                        (<>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "flex-end",
                                                    gap: 1,
                                                    width: "100%",
                                                }}
                                            >
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    bgcolor: "#fff",
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: "18px 18px 18px 4px",
                                                    maxWidth: "100%",
                                                }}
                                            >
                                                {mess.content ? mess.content : 'Tin nhắn đã được thu hồi'}
                                                {renderReactionBadge(mess.messageId, "right")}
                                            </Box>
                                            {renderMessageActions(mess, "right")}
                                            </Box>
                                        </>) :


                                        (<>
                                            <Box
                                                sx={{
                                                    display: "flex",

                                                    mb: 1,
                                                    width: "100%",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 240,
                                                        overflow: "hidden",
                                                        borderRadius: "18px 18px 4px 18px",
                                                        bgcolor: "#b30000",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: "100%",
                                                            height: 170,
                                                            overflow: "hidden",
                                                            position: "relative",
                                                            bgcolor: "black",
                                                        }}
                                                    >
                                                        {
                                                            (mess.type === 'video/mp4') ?

                                                                (<><Box
                                                                    component="video"
                                                                    controls
                                                                    src={mess.mediaURL ? mess.mediaURL : ''}

                                                                    sx={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                /></>) :


                                                                (<><Box
                                                                    component="img"
                                                                    src={mess.mediaURL ? mess.mediaURL : ''}
                                                                    alt="image message"
                                                                    sx={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                />

                                                                    <Box
                                                                        component="a"
                                                                        href={mess.mediaURL ? mess.mediaURL : ''}
                                                                        target='_blank'
                                                                        download={mess.fileName}
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 8,
                                                                            right: 8,
                                                                            width: 34,
                                                                            height: 34,
                                                                            borderRadius: "50%",
                                                                            bgcolor: "#fff",
                                                                            color: "black",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            textDecoration: "none",
                                                                            fontSize: 18,
                                                                            fontWeight: 700,
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        ↓
                                                                    </Box>
                                                                </>)
                                                        }




                                                    </Box>

                                                    {
                                                        mess.content && (
                                                            <>
                                                                <Box
                                                                    sx={{
                                                                        px: 1.5,
                                                                        py: 1,
                                                                        fontSize: 14,
                                                                        lineHeight: 1.4,
                                                                        wordBreak: "break-word",
                                                                    }}
                                                                >
                                                                    {mess.content}
                                                                </Box>
                                                            </>
                                                        )
                                                    }


                                                </Box>
                                            </Box>

                                        </>)
                                }
                                </Box>

                            </Box>

                        </>
                    )
                }
                else {
                    return (
                        <>

                            {
                                (mess.type === 'text' && mess.content) ? (

                                    // mess reply 

                                    <Box
                                        key={mess.messageId}
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                alignItems: "flex-end",
                                                gap: 1,
                                                width: "100%",
                                                "&:hover .message-actions": {
                                                    opacity: 1,
                                                    pointerEvents: "auto",
                                                },
                                            }}
                                        >
                                            {renderMessageActions(mess, "left")}
                                            <Box
                                                sx={{
                                                    position: "relative",
                                                    bgcolor: "#b30000",
                                                    color: "#fff",
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: "18px 18px 4px 18px",
                                                    maxWidth: "70%",
                                                }}
                                            >
                                                {mess.content ? mess.content : 'Bạn đã thu hồi tin nhắn'}
                                                {renderReactionBadge(mess.messageId, "left")}
                                            </Box>
                                        </Box>
                                        {renderOutgoingStatus(mess)}

                                    </Box>) :


                                    (<Box
                                        key={mess.messageId}
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 240,
                                                overflow: "hidden",
                                                borderRadius: "18px 18px 4px 18px",
                                                bgcolor: "#b30000",
                                                color: "#fff",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    height: 170,
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    bgcolor: "black",
                                                }}
                                            >
                                                {
                                                    (mess.type === 'video/mp4') ?

                                                        (<><Box
                                                            component="video"
                                                            controls
                                                            src={mess.mediaURL ? mess.mediaURL : ''}

                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                        /></>) :


                                                        (<><Box
                                                            component="img"
                                                            src={mess.mediaURL ? mess.mediaURL : ''}
                                                            alt="image message"
                                                            sx={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                                display: "block",
                                                            }}
                                                        />

                                                            <Box
                                                                component="a"
                                                                href={mess.mediaURL ? mess.mediaURL : ''}
                                                                target='_blank'
                                                                download={mess.fileName}
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 8,
                                                                    right: 8,
                                                                    width: 34,
                                                                    height: 34,
                                                                    borderRadius: "50%",
                                                                    bgcolor: "#fff",
                                                                    color: "black",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    textDecoration: "none",
                                                                    fontSize: 18,
                                                                    fontWeight: 700,
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                ↓
                                                            </Box>
                                                        </>)
                                                }




                                            </Box>

                                            {
                                                mess.content && (
                                                    <>
                                                        <Box
                                                            sx={{
                                                                px: 1.5,
                                                                py: 1,
                                                                fontSize: 14,
                                                                lineHeight: 1.4,
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {mess.content}
                                                        </Box>
                                                    </>
                                                )
                                            }


                                        </Box>
                                    </Box>
                                        {renderOutgoingStatus(mess)}
                                    </Box>)
                            }


                        </>
                    )
                }
            })}

            {false && loadingOlderMessages && (
                <Box
                    sx={{
                        width: "100%",
                        minHeight: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <CircularProgress aria-label="Loading…" size={28} thickness={4} />
                </Box>
            )}

        </Box >

    )
}
