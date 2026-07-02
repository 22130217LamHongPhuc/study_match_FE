import { Box, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import MailIcon from "@mui/icons-material/Mail";
import ContactsIcon from "@mui/icons-material/Contacts";
import React from "react";

export interface TabItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface ConnectionTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TABS: TabItem[] = [
  {
    id: "suggested-friends",
    label: "Gợi ý bạn học",
    description: "Tìm sinh viên phù hợp với mục tiêu",
    icon: <PersonAddIcon fontSize="small" />,
  },
  {
    id: "suggested-groups",
    label: "Gợi ý nhóm học",
    description: "Khám phá các nhóm học phù hợp",
    icon: <GroupIcon fontSize="small" />,
  },
  {
    id: "friend-requests",
    label: "Lời mời kết bạn",
    description: "Quản lý lời mời đã nhận và gửi",
    icon: <MailIcon fontSize="small" />,
  },
  {
    id: "my-friends",
    label: "Bạn bè của tôi",
    description: "Xem danh sách bạn học đã kết nối",
    icon: <ContactsIcon fontSize="small" />,
  },
];

export default function ConnectionTabs({ activeTab, onTabChange }: ConnectionTabsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
        mb: 4,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Box
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 2,
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: isActive ? "#fff7ed" : "#ffffff", // Nền cam nhạt nếu active
              border: isActive ? "1px solid #f97316" : "1px solid #e5e7eb", // Viền cam nếu active
              boxShadow: isActive ? "0 4px 12px rgba(249, 115, 22, 0.1)" : "0 2px 4px rgba(0,0,0,0.02)",
              "&:hover": {
                borderColor: isActive ? "#f97316" : "#fdba74",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  backgroundColor: isActive ? "#f97316" : "#f3f4f6",
                  color: isActive ? "#ffffff" : "#6b7280",
                }}
              >
                {tab.icon}
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "15px",
                  color: isActive ? "#ea580c" : "#374151",
                }}
              >
                {tab.label}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: 1.4,
              }}
            >
              {tab.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
