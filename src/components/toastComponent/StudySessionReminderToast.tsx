import { Box, Button, Typography } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useNavigate } from "react-router-dom";

type StudySessionReminderToastProps = {
  title: string;
  startTime: string;
  groupName?: string | null;
  subjectName?: string | null;
  studyMode?: string | null;
  location?: string | null;
  minutesBefore?: number | null;
};

function formatReminderTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function StudySessionReminderToast({
  title,
  startTime,
  groupName,
  subjectName,
  studyMode,
  location,
  minutesBefore,
}: StudySessionReminderToastProps) {
  const navigate = useNavigate();
  const hanldeViewSchedule = () => {
    navigate("/schedule");
  };

  const reminderText =
    minutesBefore && minutesBefore > 0
      ? `trong ${minutesBefore} phút`
      : "ngay bây giờ";

  return (
    <Box
      sx={{
        width: 350,
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderLeft: "4px solid #f97316",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Top Header Row with Icon & Reminder Meta */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff7ed",
            color: "#f97316",
            flexShrink: 0,
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: "#f97316",
              }}
            >
              Nhắc lịch học
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 500,
                color: "#64748b",
              }}
            >
              • Bắt đầu {reminderText}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1e293b",
              lineHeight: 1.3,
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Mid Section - Clean Information Grid */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          pl: 0.5,
        }}
      >
        <Row
          icon={<AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />}
          label={formatReminderTime(startTime)}
        />

        {subjectName || groupName ? (
          <Row
            icon={<MenuBookOutlinedIcon sx={{ fontSize: 16 }} />}
            label={[subjectName, groupName].filter(Boolean).join(" - ")}
          />
        ) : null}

        {studyMode || location ? (
          <Row
            icon={<RoomOutlinedIcon sx={{ fontSize: 16 }} />}
            label={[studyMode, location].filter(Boolean).join(" • ")}
          />
        ) : null}
      </Box>

      {/* Bottom Row - Tiny reminder text and action button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          mt: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: "#64748b",
            fontWeight: 500,
            lineHeight: 1.3,
            flex: 1,
          }}
        >
          Hãy chuẩn bị tài liệu để buổi học đạt hiệu quả tốt nhất.
        </Typography>

        <Button
          onClick={hanldeViewSchedule}
          size="small"
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            py: 0.75,
            fontSize: 12,
            fontWeight: 600,
            bgcolor: "#fff7ed",
            color: "#ea580c",
            border: "1px solid rgba(249, 115, 22, 0.15)",
            boxShadow: "none",
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "#ffedd5",
              boxShadow: "none",
              border: "1px solid rgba(249, 115, 22, 0.25)",
            },
          }}
        >
          Xem lịch
        </Button>
      </Box>
    </Box>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: "#475569",
          lineHeight: 1.35,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

