import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import AcademicInfoCard from "./components/AcademicInfoCard";
import FreeTimeCard from "./components/FreeTimeCard";
import ProfileHeaderCard from "./components/ProfileHeaderCard";
import ScheduleTable from "./components/ScheduleTable";
import SubjectsCard from "./components/SubjectsCard";
import { useProfileData } from "./hooks/useProfileData";

export default function MyProfilePage() {
  const userId = Number(localStorage.getItem("userId"));

  const { profileVm, loading } = useProfileData(userId);

  if (loading) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#f97316" }} />
      </Box>
    );
  }

  if (!profileVm) {
    return (
      <Alert severity="error" sx={{ m: 3, borderRadius: 2 }}>
        Không có dữ liệu hồ sơ để hiển thị.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "80%",
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 4 },
        bgcolor: "transparent",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "85%", xl: "74%" },
          mx: "auto",
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ borderBottom: "1px solid #e5e7eb", pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937" }}>
              Hồ sơ học tập
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#6b7280" }}>
              Cập nhật lúc: {profileVm.createdAtLabel}
            </Typography>
          </Box>

          <ProfileHeaderCard profile={profileVm} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            <AcademicInfoCard profile={profileVm} />
            <SubjectsCard profile={profileVm} />
          </Box>

          <FreeTimeCard profile={profileVm} />
          <ScheduleTable profile={profileVm} />
        </Stack>
      </Box>
    </Box>
  );
}
