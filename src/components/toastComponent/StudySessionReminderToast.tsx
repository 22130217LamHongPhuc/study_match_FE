import { Box, Button, Typography } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

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
  console.log("StudySessionReminderToast rendered with: ", {
    title,
    startTime,
    groupName,
    subjectName,
    studyMode,
    location,
    minutesBefore,
  });
  const reminderText =
    minutesBefore && minutesBefore > 0
      ? `Sắp bắt đầu trong ${minutesBefore} phút`
      : "Sắp bắt đầu";

  return (
    <Box
      sx={{
        width: 360,
        borderRadius: 3,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(255,247,237,0.98) 0%, rgba(255,255,255,0.98) 60%, rgba(255,237,213,0.98) 100%)",
        border: "1px solid rgba(249, 115, 22, 0.18)",
        boxShadow: "0 18px 40px rgba(194, 65, 12, 0.14)",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          background:
            "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(251,191,36,0.1) 100%)",
          borderBottom: "1px solid rgba(249, 115, 22, 0.1)",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fff",
            color: "#c2410c",
            border: "1px solid rgba(249, 115, 22, 0.18)",
          }}
        >
          <SchoolOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: "#c2410c",
            }}
          >
            Nhắc lịch học
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1f2937",
              lineHeight: 1.25,
              mt: 0.15,
            }}
          >
            {reminderText}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.75 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.3,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "grid", gap: 0.75 }}>
          <Row
            icon={<AccessTimeOutlinedIcon />}
            label={formatReminderTime(startTime)}
          />
          {groupName ? (
            <Row icon={<MenuBookOutlinedIcon />} label={groupName} />
          ) : null}
          {subjectName ? (
            <Row icon={<SchoolOutlinedIcon />} label={subjectName} />
          ) : null}
          {studyMode ? (
            <Row icon={<RoomOutlinedIcon />} label={studyMode} />
          ) : null}
          {location ? (
            <Row icon={<RoomOutlinedIcon />} label={location} />
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mt: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
            Chuẩn bị tài liệu và vào đúng giờ để buổi học hiệu quả hơn.
          </Typography>

          <Button
            onClick={() => (window.location.href = "/schedule")}
            size="small"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 1.6,
              py: 0.7,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: "#f97316",
              boxShadow: "none",
              "&:hover": { bgcolor: "#ea580c", boxShadow: "none" },
            }}
          >
            Xem lịch
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box sx={{ color: "#f97316", display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
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
