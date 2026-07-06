import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { ProfileViewModel } from "../types";
import UpdateProfileDialog from "./UpdateProfileDialog";

interface ProfileHeaderCardProps {
  profile: ProfileViewModel;
}

export default function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#2563eb",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            <PersonOutlineIcon sx={{ fontSize: 32 }} />
          </Avatar>

          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937" }}>
              {profile.fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#4b5563" }}>
              MSSV: {profile.studentCode}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Giới tính: {profile.gender} • Độ tuổi: {profile.ageGroup} • Khu vực: {profile.region}
            </Typography>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={profile.cohortLabel}
              sx={{
                bgcolor: "#f0f7ff",
                color: "#1d4ed8",
                fontWeight: 600,
                border: "1px solid #e0effe",
              }}
            />

            <IconButton
              size="small"
              onClick={() => setOpenEdit(true)}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  color: "#2563eb",
                  bgcolor: "#f0f7ff",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </CardContent>

      <UpdateProfileDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        profile={profile}
      />
    </Card>
  );
}
