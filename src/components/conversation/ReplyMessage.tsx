import CancelPresentationIcon from '@mui/icons-material/CancelPresentation'
import { IconButton, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

export default function ReplyMessage({
    fullName,
    mess,
    setReplyMess,
}: {
    fullName: string
    mess: string
    setReplyMess: React.Dispatch<React.SetStateAction<any>>
}) {
    return (
        <Box
            sx={{
                width: "100%",
                bgcolor: "#fff",
                borderTop: "1px solid rgba(0,0,0,0.12)",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <Box
                sx={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111",
                        lineHeight: 1.2,
                    }}
                >
                    Đang trả lời {fullName}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 14,
                        color: "#555",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "calc(100vw - 80px)",
                    }}
                >
                    {mess}
                </Typography>
            </Box>

            <IconButton
                sx={{
                    p: 0.5,
                    color: "#111",
                    flexShrink: 0,
                    "&:hover": {
                        bgcolor: "rgba(0,0,0,0.06)",
                    },
                }}
                onClick={() => setReplyMess(null)}
            >
                <CancelPresentationIcon sx={{ fontSize: 20 }} />
            </IconButton>
        </Box>
    )
}
