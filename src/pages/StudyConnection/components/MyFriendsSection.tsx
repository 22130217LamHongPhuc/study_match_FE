import { Box, Typography } from "@mui/material";

export default function MyFriendsSection() {
  return (
    <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
      <Typography variant="h6" sx={{ color: "#374151", mb: 1 }}>
        Bạn bè của tôi
      </Typography>
      <Typography sx={{ color: "#6b7280" }}>
        Tính năng đang được phát triển...
      </Typography>
    </Box>
  );
}
