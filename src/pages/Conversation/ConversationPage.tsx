import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import ImageIcon from "@mui/icons-material/Image";
import GifBoxIcon from "@mui/icons-material/GifBox";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";
import WelcomeConversation from "../../components/conversation/WelcomeConversion";
import {
    Avatar,
    Box,
    IconButton,
    InputBase,
    Paper,
    Typography,
    TextField,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React, { use, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Client } from "@stomp/stompjs";
import WebSocketManager from "../../socket/WebSocketManager";
import { loadConversation, sendText } from "../../services/ChatService";
import { South } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { MessageInterface } from "../../model/Conversation";
import { APIResponse } from "../../model/APIResponse";
import ListFriends from "../../components/conversation/ListFriends";
import ListMess from "../../components/conversation/ListMess";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import ReplyMessage from "../../components/conversation/ReplyMessage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { updateCurrentConverId } from "../../redux/ChatReducer";
import { SocketEvent } from "../../enum/SocketEvent";
export default function ConversationPage() {
    const dispatch = useDispatch()
    const [replymess, setReplyMess] = useState<MessageInterface | null>(null)
    console.error("đây là replymess", replymess)
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    console.log("messageText", messageText)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const stompClient = useRef<Client | null>(null);
    const currentUserId = Number(localStorage.getItem('userId'))
    const location = useLocation();
    const targetUserId = location.state?.targetUserId;
    const avatar = location.state?.avatar;
    const fullName = location.state?.fullName;
    const [conversation, setConversation] = useState<MessageInterface[]>([]);
    console.log("conversation", conversation)
    const conversationId = useRef<number | null>(null)

    // useLayoutEffect(() => {
    //     let ws = WebSocketManager.getInstance()
    //     console.log("đây là userId", localStorage.getItem('userId'))

    // }, [])
    console.log("đây là conversation sau khi set", conversation)
    const sendMessage = () => {
        console.log("gửi nè")
        if (messageText.trim().length === 0) return
        const senderId = Number(localStorage.getItem('userId'));
        sendText(messageText, senderId, conversationId.current as number);


        // setConversation((prev) => {
        //     const newMessage: MessageInterface = {
        //         messageId: Date.now(),
        //         senderId: Number(localStorage.getItem('userId')),
        //         type: 'text',
        //         content: messageText,
        //         mediaURL: null,
        //         fileName: null,
        //         createAt: new Date().toISOString()
        //     }
        //     return [newMessage, ...prev];
        // })
        // setMessageText("");
    }
    console.warn("đây là conversationId", conversationId)

    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        console.log(emojiObject);
        setMessageText((prev) => prev + emojiObject.emoji);
        // setShowEmojiPicker(false);
    }
    useLayoutEffect(() => {
        const loadMess = async () => {
            console.log("đây là targetUserId", targetUserId)
            console.log("đây là currentUserId", currentUserId)
            const result: APIResponse = await loadConversation(currentUserId, targetUserId);
            console.log("đây là result", result.data)
            conversationId.current = result.data.conversationId;
            dispatch(updateCurrentConverId({ currentConversationId: result.data.conversationId }))
            console.warn("đây là conversationId sau khi loadMess", conversationId.current)
            setConversation(result.data.listMess);
        }
        loadMess();
        if (!conversationId.current) return
    }, [targetUserId, currentUserId])

    const storeNewMess = useSelector((state: RootState) => state.chat.newMess)
    const storeConverId = useSelector((state: RootState) => state.chat.currentConversationId)
    const storeEvent = useSelector((state: RootState) => state.chat.newMess?.event)
    useEffect(() => {
        if (!storeNewMess || conversationId.current !== storeConverId) return
        console.log(storeEvent, 'socket event nè')
        if (storeEvent === SocketEvent.MESSAGE_ACK || storeEvent === SocketEvent.NEW_MESSAGE) {
            console.log('trong conver page', storeNewMess)
            setConversation((prev: any[]) => {
                return [storeNewMess.data?.message, ...prev];
            })
            setMessageText("");
        }
    }, [storeNewMess, storeEvent])


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
                        <Avatar
                            src="https://i.pravatar.cc/100?img=12"
                            sx={{ width: 52, height: 52 }}
                        />
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1f1f1f" }}>
                                {fullName}
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: "#7f735e" }}>
                                Hoạt động 9 phút trước
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton sx={{ color: "rgb(55, 145, 250)" }}>
                            <CallIcon />
                        </IconButton>
                        <IconButton sx={{ color: "rgb(55, 145, 250)" }}>
                            <VideocamIcon />
                        </IconButton>
                    </Box>
                </Box>
                {conversation ? <ListMess conversation={conversation} setReplyMess={setReplyMess} /> : <WelcomeConversation />}

                {/* thanh reply nè */}
                {
                    replymess && (<>   <ReplyMessage fullName={fullName}
                        mess={replymess ? replymess.content : ""}
                        setReplyMess={setReplyMess}
                    />  </>)
                }


                {/* thanh trả lời nè */}
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
                        borderTop: "1px solid rgba(0,0,0,0.08)",
                        zIndex: 1,
                    }}
                >
                    <IconButton sx={{ color: "#a40000", p: 0.5 }}>
                        <MicIcon />
                    </IconButton>
                    <IconButton sx={{ color: "#a40000", p: 0.5 }}>
                        <ImageIcon />
                    </IconButton>
                    <IconButton sx={{ color: "#a40000", p: 0.5 }}>
                        <AddPhotoAlternateIcon />
                    </IconButton>
                    <IconButton sx={{ color: "#a40000", p: 0.5 }}>
                        <GifBoxIcon />
                    </IconButton>

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
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
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
                            <IconButton
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                                sx={{ color: "#a40000", p: 0.5 }}
                            >
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
            <ListFriends></ListFriends>

        </Box>
    );
}
