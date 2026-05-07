import { Box, Typography } from '@mui/material'
import React from 'react'

export default function WelcomeConversion() {
    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3,
                py: 4,
                bgcolor: "#eef1f8",
                overflow: "hidden",
            }}
        >
            <Box
                component="img"
                src="https://app.studystream.live/assets/images/select-conversation-img.svg"
                alt="empty state"
                sx={{
                    width: "min(360px, 72%)",
                    maxHeight: "62%",
                    objectFit: "contain",
                    opacity: 0.9,
                    mb: 3,
                }}
            />

            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: { xs: 16, md: 18 },
                    color: "#1f2a44",
                }}
            >
                Hãy bắt đầu cuộc hội thoại nào
            </Typography>
        </Box>
    )
}
