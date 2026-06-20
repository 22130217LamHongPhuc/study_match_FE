import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { ProfileViewModel } from "../types";

interface SubjectsCardProps {
  profile: ProfileViewModel;
}

export default function SubjectsCard({ profile }: SubjectsCardProps) {
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
            Môn học
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 500 }}>
              Môn chính
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {profile.mainSubjectName}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 500 }}>
              Môn đang học
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {profile.enrolledSubjects.map((subject) => (
                <Chip
                  key={subject.subjectId}
                  label={`${subject.subjectCode} - ${subject.subjectName}`}
                  variant="outlined"
                  sx={{
                    borderColor: "#e5e7eb",
                    bgcolor: "#f9fafb",
                    borderRadius: 2,
                    color: "#4b5563",
                    fontSize: 13,
                    fontWeight: 500,
                    px: 0.5,
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
