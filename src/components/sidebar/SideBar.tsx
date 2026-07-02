import { List, ListItemButton } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import BarChartIcon from "@mui/icons-material/BarChart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
}

const navItems: NavItem[] = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/home" },
  { label: "Hồ sơ", icon: <BadgeIcon />, path: "/my-profile" },
  { label: "Lịch học", icon: <CalendarMonthIcon />, path: "/schedule" },
  { label: "Gợi ý bạn học", icon: <BarChartIcon />, path: "/recommendation" },
  { label: "Bạn bè", icon: <PersonIcon />, path: "/friends" },
  {
    label: "Cuộc hội thoại",
    icon: <QuestionAnswerIcon />,
    path: "/conversation",
  },
  { label: "Nhóm", icon: <Diversity2Icon />, path: "/groups" },
  { label: "Phản hồi", icon: <FeedbackIcon />, path: "/feedback" },
];

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: "230px",
        minHeight: "100vh",
        background: "#fffaf5",
        borderRight: "1px solid #f0e6d9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid #f0e6d9",
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SchoolIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: "#1f2937",
              letterSpacing: "-0.2px",
              display: "block",
              lineHeight: 1.3,
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
            }}
          >
            Kết nối học tập
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 1.5, flex: 1 }}>
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

        <List disablePadding>
          {navItems.map((item) => {
            const isActive =
              Boolean(item.path) && location.pathname === item.path;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                sx={{
                  py: 1.2,
                  px: 1.5,
                  borderRadius: "10px",
                  mb: 0.3,
                  cursor: item.path ? "pointer" : "default",
                  bgcolor: isActive ? "#fff7ed" : "transparent",
                  color: isActive ? "#ea580c" : "#4b5563",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#fff7ed" : "#fef3e2",
                    color: "#ea580c",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isActive ? "#f97316" : "#9ca3af",
                    fontSize: 20,
                    mr: 1.5,
                    transition: "color 0.15s ease",
                  },
                  "&:hover .MuiSvgIcon-root": {
                    color: "#f97316",
                  },
                }}
              >
                {item.icon}
                <Box component="span">{item.label}</Box>
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
