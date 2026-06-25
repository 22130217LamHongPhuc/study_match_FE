import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { ProfileViewModel } from "../types";

interface AcademicInfoCardProps {
  profile: ProfileViewModel;
}

function MetricItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1f2937" }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function AcademicInfoCard({ profile }: AcademicInfoCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        background: "#ffffff",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1f2937" }}
          >
            Thông tin học tập
          </Typography>

          <MetricItem label="Học kỳ" value={profile.termLabel} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <MetricItem label="Năm học" value={`Năm ${profile.studyYearNo}`} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MetricItem label="Học kỳ thứ" value={profile.semesterNo} />
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "#f3f4f6" }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <MetricItem label="Điểm TB" value={profile.avgScore.toFixed(2)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <MetricItem label="Tín chỉ đã học" value={profile.studiedCredits} />
            </Box>
          </Stack>

          <MetricItem label="Trình độ" value={profile.studyGoal} />
          <MetricItem label="Chế độ học" value={profile.studyModeLabel} />
        </Stack>
      </CardContent>
    </Card>
  );
}
