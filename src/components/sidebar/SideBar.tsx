import { List, ListItemButton, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import BarChartIcon from "@mui/icons-material/BarChart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
}

const navItems: NavItem[] = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/home" },
  { label: "Hồ sơ học tập", icon: <BadgeIcon />, path: "/my-profile" },
  { label: "Lịch học", icon: <CalendarMonthIcon />, path: "/schedule" },
  { label: "Kết nối học tập", icon: <BarChartIcon />, path: "/recommendation" },
  // { label: "Bạn bè", icon: <PersonIcon />, path: "/friends" },
  {
    label: "Cuộc hội thoại",
    icon: <QuestionAnswerIcon />,
    path: "/conversation",
  },
  { label: "Nhóm", icon: <Diversity2Icon />, path: "/groups" },
  // { label: "Phản hồi", icon: <FeedbackIcon />, path: "/feedback" },
];

interface SideBarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function SideBar({ collapsed = false, onToggle }: SideBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: collapsed ? "72px" : "230px",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "visible", // Critical to allow absolute toggle button to display
      }}
    >
      {/* Floating Toggle Button sitting on the border */}
      {(isHovered || collapsed) && onToggle && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          sx={{
            position: "absolute",
            right: "-14px",
            top: "24px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 9999,
            color: "#4b5563",
            transition: "all 0.15s ease",
            "&:hover": {
              background: "#f8fafc",
              color: "#2563eb",
              transform: "scale(1.1)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            },
          }}
        >
          {collapsed ? (
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          )}
        </Box>
      )}

      <Box
        sx={{
          px: collapsed ? 1.5 : 2.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 1.5,
          borderBottom: "1px solid #e2e8f0",
          height: "64px",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SchoolIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: "#1f2937",
                letterSpacing: "-0.2px",
                display: "block",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              StudyMatch
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              Kết nối học tập
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 1.5, py: 1.5, flex: 1, overflowY: "auto" }}>
        {!collapsed && (
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              px: 1,
              mb: 0.5,
              display: "block",
            }}
          >
            Menu chính
          </Box>
        )}

        <List disablePadding>
          {navItems.map((item) => {
            const isActive =
              Boolean(item.path) && location.pathname === item.path;

            const buttonContent = (
              <ListItemButton
                onClick={() => item.path && navigate(item.path)}
                sx={{
                  py: 1.2,
                  px: collapsed ? 0 : 1.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "10px",
                  mb: 0.3,
                  cursor: item.path ? "pointer" : "default",
                  bgcolor: isActive ? "#f0f7ff" : "transparent",
                  color: isActive ? "#1d4ed8" : "#4b5563",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.15s ease",
                  minWidth: 0,
                  "&:hover": {
                    bgcolor: isActive ? "#f0f7ff" : "#f1f5f9",
                    color: "#1d4ed8",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isActive ? "#2563eb" : "#9ca3af",
                    fontSize: 20,
                    mr: collapsed ? 0 : 1.5,
                    transition: "color 0.15s ease",
                    flexShrink: 0,
                  },
                  "&:hover .MuiSvgIcon-root": {
                    color: "#2563eb",
                  },
                }}
              >
                {item.icon}
                {!collapsed && (
                  <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                    {item.label}
                  </Box>
                )}
              </ListItemButton>
            );

            return collapsed ? (
              <Tooltip key={item.label} title={item.label} placement="right" arrow>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {buttonContent}
                </div>
              </Tooltip>
            ) : (
              <React.Fragment key={item.label}>
                {buttonContent}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
