
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Avatar, Box, TextField, Typography } from '@mui/material'
import React from 'react'
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import ImageIcon from "@mui/icons-material/Image";
import GifBoxIcon from "@mui/icons-material/GifBox";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SendIcon from "@mui/icons-material/Send";

export default function ListFriends() {
    const users = [
        {
            id: 1,
            name: "okeeee",
            avatar: "https://i.pravatar.cc/100?img=1",
            verified: true,
            badge: "75",
            lastMessage: "Hello bro!",
        },
        {
            id: 2,
            name: "ZE Z",
            avatar: "https://i.pravatar.cc/100?img=2",
            verified: false,
            badge: "100",
            lastMessage: "",
        },
    ];
    return (
        <div>
            <Box
                sx={{
                    width: "25%",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: "10px",
                    overflow: "hidden",
                    borderLeft: "1px solid rgba(0,0,0,0.08)",
                    bgcolor: "#fff",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: "10px",
                        mb: 2,
                        flexShrink: 0,
                    }}
                >
                    <ArrowForwardIcon sx={{ color: "#8d8fa3" }} />
                    <Typography sx={{ fontWeight: 700 }}>Bạn bè</Typography>
                    <Box sx={{ width: 24 }} />
                </Box>

                <TextField
                    fullWidth
                    placeholder="Tìm kiếm bạn bè"
                    variant="outlined"
                    size="small"
                    sx={{
                        mb: 2,
                        flexShrink: 0,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            bgcolor: "#f4f6fb",
                        },
                        "& .MuiOutlinedInput-input": {
                            padding: "10px",
                        },
                    }}
                />

                <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                    {users.map((user) => (
                        <Box
                            key={user.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                                px: 1,
                                borderRadius: "14px",
                                "&:hover": {
                                    bgcolor: "#f0f2f8",
                                    cursor: "pointer",
                                },
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ position: "relative" }}>
                                    <Avatar src={user.avatar} sx={{ width: 45, height: 45 }} />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            right: -2,
                                            bottom: -2,
                                            width: 14,
                                            height: 14,
                                            borderRadius: "50%",
                                            bgcolor: "#48d26d",
                                            border: "2px solid white",
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{ fontSize: 15, fontWeight: 600, color: "#1f2a44" }}
                                    >
                                        {user.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            color: "#8d8fa3",
                                            mt: "2px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "160px",
                                        }}
                                    >
                                        {user.lastMessage}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </div>
    )
}
