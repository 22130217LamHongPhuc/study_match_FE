
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ReplyIcon from '@mui/icons-material/Reply'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import { Avatar, Box, IconButton } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { MessageInterface } from '../../model/Conversation'
import { submitReaction } from '../../services/ReactionService'
export default function ListMess({ conversation, setReplyMess }: { conversation: MessageInterface[]; setReplyMess: React.Dispatch<React.SetStateAction<MessageInterface | null>> }) {
    const [activeReactionMessageId, setActiveReactionMessageId] = useState<number | null>(null)
    const [activeMoreMessageId, setActiveMoreMessageId] = useState<number | null>(null)
    const [messageReactions, setMessageReactions] = useState<Record<number, string>>({})
    const moreMenuRef = useRef<HTMLDivElement | null>(null)


    const reactions = ["\u2764\ufe0f", "\ud83d\ude06", "\ud83d\ude2e", "\ud83d\ude22", "\ud83d\ude21", "\ud83d\udc4d"]
    const moreActions = ["Gỡ", "Chuyển tiếp", "Ghim", "Báo cáo"]

    useEffect(() => {
        if (activeMoreMessageId === null) {
            return
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setActiveMoreMessageId(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [activeMoreMessageId])
    const hanldeClickEmojj = (messageId: number, emojj: string) => {
        console.log("Clicked emoji:", emojj, "for message ID:", messageId);

        submitReaction(emojj, messageId, Number(localStorage.getItem("userId"))).then((res) => {
            console.warn(res);
            if (res?.code === 200) {
                setActiveReactionMessageId(null);
                setMessageReactions((prev) => ({
                    ...prev,
                    [messageId]: res?.data?.emoji ?? emojj,
                }));
                setActiveMoreMessageId(null);
            }
        }).catch((err) => {
            console.error("Lỗi submit reaction:", err);
        });
        console.log({ messageId, emojj })

    }
    return (
        <Box
            sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column-reverse",
                overflowY: "auto",
                width: "100%",
                px: 2,
                py: 2,
                background: "linear-gradient(180deg, #f7e19a, #f6885d)",
            }}
        >
            {conversation.map((mess) => {
                if (mess.senderId === Number(localStorage.getItem("userId"))) {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-start",
                                mb: 1,
                                alignItems: "flex-end",
                                gap: 1,
                            }} key={mess.messageId}
                        >
                            <Avatar
                                src="https://i.pravatar.cc/100?img=12"
                                sx={{ width: 30, height: 30 }}
                            />
                            <Box
                                ref={activeMoreMessageId === mess.messageId ? moreMenuRef : undefined}
                                sx={{
                                    position: "relative",
                                    bgcolor: "#fff",
                                    px: 2,
                                    py: 1,
                                    borderRadius: "18px 18px 18px 4px",
                                    maxWidth: "70%",
                                }}
                            >
                                {mess.content}
                                {messageReactions[mess.messageId] && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            right: -8,
                                            bottom: -12,
                                            width: 22,
                                            height: 22,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#fff",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            borderRadius: "50%",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.16)",
                                            fontSize: 13,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {messageReactions[mess.messageId]}
                                    </Box>
                                )}
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.25,
                                    mb: 0.25,
                                    position: "relative",
                                }}
                            >
                                {activeReactionMessageId === mess.messageId && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: 0,
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
                                        <IconButton
                                            size="small"
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                p: 0,
                                                bgcolor: "#f1f3f4",
                                                color: "#202124",
                                                "&:hover": { bgcolor: "#e8eaed" },
                                            }}
                                        >
                                            <AddIcon sx={{ fontSize: 22 }} />
                                        </IconButton>
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
                                    onClick={() => setReplyMess(mess)}
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
                                            left: "calc(100% + 6px)",
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
                                        {moreActions.map((action) => (
                                            <Box
                                                component="button"
                                                key={action}
                                                type="button"
                                                onClick={() => setActiveMoreMessageId(null)}
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
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )
                }
                else {
                    return (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                            <Box
                                sx={{
                                    position: "relative",
                                    bgcolor: "#b30000",
                                    color: "#fff",
                                    px: 2,
                                    py: 1,
                                    borderRadius: "18px 18px 4px 18px",
                                    maxWidth: "70%",
                                }} key={mess.messageId}
                            >
                                {mess.content}
                                {messageReactions[mess.messageId] && (
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            left: -8,
                                            bottom: -12,
                                            width: 22,
                                            height: 22,
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
                                        }}
                                    >
                                        {messageReactions[mess.messageId]}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )
                }
            })}
        </Box>
    )
}
