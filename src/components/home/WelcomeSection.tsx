import React from "react";
import { Box, Typography, Paper, Avatar, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
    }
    70% {
      transform: scale(1.1);
      box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }
`;

export default function WelcomeSection() {
  const navigate = useNavigate();

  // Mock list of direct messages inside the DMs panel matching user's reference image
  const mockDMs = [
    {
      id: 1,
      name: "Michael Buffet",
      message: "heeey 😊👋",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      time: "11:07 am",
      unread: 1,
      status: "received",
    },
    {
      id: 2,
      name: "Aliko Dangote",
      message: "yo what's up how u been?",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      time: "Yesterday",
      unread: 1,
      status: "received",
    },
    {
      id: 3,
      name: "Ali Hoseini-Khamenei",
      message: "nah I don't think that would work...",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=100&q=80",
      time: "19th Sep",
      unread: 3,
      status: "received",
    },
    {
      id: 4,
      name: "Abigail Johnson",
      message: "thanks!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      time: "3 days ago",
      unread: 0,
      status: "sent",
    },
    {
      id: 5,
      name: "Bernard Arnault",
      message: "see you",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      time: "Last week",
      unread: 0,
      status: "sent",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 75px)",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4 },
        overflowY: "auto",
      }}
    >
      <style>{pulseKeyframes}</style>

      {/* ================= SECTION TREN: SLOGAN & ONLINE STATS ================= */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "850px",
          width: "100%",
          mb: { xs: 4, md: 6 },
          gap: 2,
        }}
      >
        {/* Active Online Status Pill */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.2,
            bgcolor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "30px",
            px: 2,
            py: 0.6,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#22c55e",
              animation: "pulse 2s infinite ease-in-out",
            }}
          />
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "1px",
              color: "#16a34a",
            }}
          >
            16,869 HỌC VIÊN ĐANG ONLINE
          </Typography>
        </Box>

        {/* Motivational Slogan */}
        <Typography
          sx={{
            fontSize: { xs: "26px", sm: "34px", md: "42px" },
            fontWeight: 800,
            lineHeight: 1.25,
            color: "#0f172a",
          }}
        >
          Nỗ lực theo đuổi ước mơ đã khó. Nhưng không đạt được ước mơ còn khó hơn.
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Học tập và cùng làm việc với các học viên khác từ khắp nơi trên thế giới 🌍
        </Typography>
      </Box>

      {/* ================= SECTION DUOI: WEB MOCKUP & BUTTONS ================= */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        {/* Browser Mockup Window */}
        <Box
          sx={{
            width: "100%",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
            bgcolor: "#f8fafc",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mockup macOS Header Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "40px",
              px: 2,
              bgcolor: "#f1f5f9",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{ display: "flex", gap: "6px" }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ff5f56" }} />
              <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ffbd2e" }} />
              <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#27c93f" }} />
            </Box>
          </Box>

          {/* Video & DM Panel Area */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: { xs: "4/3", sm: "16/9" },
              overflow: "hidden",
              bgcolor: "#000000",
            }}
          >
            {/* Ambient Study Lofi Video */}
            <Box
              component="video"
              autoPlay
              loop
              muted
              playsInline
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            >
              <source
                src="https://www.studystream.live/assets/videos/solo-vibe-background.webm"
                type="video/webm"
              />
            </Box>

            {/* DMs Floating Panel Overlay */}
            <Tooltip title="Nhấp chuột để mở cuộc trò chuyện" placement="left">
              <Paper
                onClick={() => navigate("/conversation")}
                sx={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  bottom: "16px",
                  width: { xs: "220px", sm: "280px" },
                  bgcolor: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.6)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.22)",
                  },
                }}
              >
                {/* DMs Header */}
                <Box
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <ArrowBackRoundedIcon sx={{ fontSize: 16, color: "#64748b", mr: 1 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                    DMs
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <AddRoundedIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                </Box>

                {/* DMs Tabs */}
                <Box
                  sx={{
                    px: 1.5,
                    pt: 1,
                    pb: 0.5,
                    display: "flex",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#3b82f6",
                      color: "#ffffff",
                      borderRadius: "15px",
                      px: 1.5,
                      py: 0.4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Chats
                  </Box>
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 11,
                      fontWeight: 600,
                      py: 0.4,
                    }}
                  >
                    Message requests
                  </Typography>
                </Box>

                {/* Direct Messages List */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    px: 1,
                    py: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {mockDMs.map((dm) => (
                    <Box
                      key={dm.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 0.8,
                        borderRadius: "8px",
                        "&:hover": { bgcolor: "#f1f5f9" },
                      }}
                    >
                      <Avatar
                        src={dm.avatar}
                        sx={{ width: 28, height: 28 }}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: dm.unread > 0 ? 700 : 600,
                            fontSize: 11.5,
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dm.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: dm.unread > 0 ? "#1e293b" : "#64748b",
                            fontWeight: dm.unread > 0 ? 600 : 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dm.message}
                        </Typography>
                      </Box>

                      {/* Right metadata (Time, unread counters, checkmarks) */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: 8, color: "#94a3b8" }}>
                          {dm.time}
                        </Typography>
                        {dm.unread > 0 ? (
                          <Box
                            sx={{
                              bgcolor: "#3b82f6",
                              color: "#ffffff",
                              borderRadius: "50%",
                              width: 14,
                              height: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 8,
                              fontWeight: 700,
                            }}
                          >
                            {dm.unread}
                          </Box>
                        ) : (
                          dm.status === "sent" && (
                            <CheckRoundedIcon sx={{ fontSize: 10, color: "#3b82f6" }} />
                          )
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Tooltip>
          </Box>
        </Box>

        {/* Download Badges */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Google Play Button */}
          <Box
            component="a"
            href="#"
            onClick={(e) => e.preventDefault()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#000000",
              color: "#ffffff",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              textDecoration: "none",
              border: "1px solid #334155",
              width: "185px",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            {/* Google Play Colored Icon */}
            <svg viewBox="0 0 512 512" width="24" height="24">
              <path fill="#2196F3" d="M48.2 16.1C44.3 20 42 25.8 42 33v446c0 7.2 2.3 13 6.2 16.9l1.6 1.6L274 273.3v-5.6L49.8 14.5l-1.6 1.6z" />
              <path fill="#4CAF50" d="M351.4 350.8L274 273.3v-5.6l77.4-77.5 1.6.9 91.6 52.2c26.2 14.9 26.2 39.4 0 54.3l-91.6 52.2-1.6.9z" />
              <path fill="#FFC107" d="M280.9 266.4L55.4 492.2c8.6 9.1 22.8 10.3 38.6 1.3l257.4-142.7-70.5-84.4z" />
              <path fill="#F44336" d="M280.9 253.6L351.4 173 94 27c-15.8-9-30-7.8-38.6 1.3l225.5 225.3z" />
            </svg>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase" }}>
                GET IT ON
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, fontFamily: "sans-serif" }}>
                Google Play
              </Typography>
            </Box>
          </Box>

          {/* App Store Button */}
          <Box
            component="a"
            href="#"
            onClick={(e) => e.preventDefault()}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "#000000",
              color: "#ffffff",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              textDecoration: "none",
              border: "1px solid #334155",
              width: "185px",
              transition: "transform 0.15s ease",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            {/* Apple Logo Icon */}
            <svg viewBox="0 0 512 512" width="24" height="24" fill="#ffffff">
              <path d="M187.2 99.3c19.3-23.3 32.4-55.7 28.8-88-27.7 1.1-61.3 18.4-81.2 41.7-17 19.8-31.9 52.6-27.9 84.3 30.9 2.4 62.7-15.1 80.3-38zM244.7 151c-43.6 0-80.8 26.7-102.5 26.7-22.1 0-52.6-22.6-86.4-22.6-44.4 0-85.3 25.2-108.1 64.9-46 79.8-11.8 197.6 32.7 262.1 21.8 31.4 47.6 66.5 81.6 65.3 32.6-1.2 45-21 84.4-21 39.3 0 50.5 21 84.4 20.3 34.6-.6 57.4-31.8 79-63.3 25-36.5 35.3-71.9 35.8-73.8-.8-.4-68.8-26.4-69.5-104.7-.6-65.7 53.6-97.3 56.1-98.8-30.8-45-78.2-50.1-95-51.1z" />
            </svg>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: "#94a3b8" }}>
                Download on the
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: "sans-serif" }}>
                App Store
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
