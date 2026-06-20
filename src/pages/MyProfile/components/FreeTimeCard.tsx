import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { ProfileViewModel } from "../types";

interface FreeTimeCardProps {
  profile: ProfileViewModel;
}

export default function FreeTimeCard({ profile }: FreeTimeCardProps) {
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
            Khung giờ rảnh
          </Typography>

          {profile.freeTimeGroups.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Chưa có dữ liệu thời gian rảnh.
            </Typography>
          ) : (
            profile.freeTimeGroups.map((group) => (
              <Stack key={group.dayId} spacing={1}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#4b5563" }}
                >
                  {group.dayLabel}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {group.slots.map((slot) => (
                    <Chip
                      key={slot.id}
                      label={`${slot.label} (${slot.time})`}
                      size="small"
                      sx={{
                        bgcolor: "#f0fdf4",
                        color: "#166534",
                        borderRadius: 2,
                        border: "1px solid #dcfce7",
                        fontWeight: 500,
                        px: 0.5,
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
