import { Avatar, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

export default function ToastCustom({ message, userName }: { message: string, userName: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                width: "100%",
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#a40000",
                        mb: 0.3,
                    }}
                >
                    Bạn có tin nhắn mới
                </Typography>

                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                        lineHeight: 1.2,
                    }}
                >
                    {userName}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 14,
                        color: "#4b5563",
                        mt: 0.5,
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {message}
                </Typography>
            </Box>
        </Box>
    )
}

