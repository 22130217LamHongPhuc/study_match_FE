import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ProfileViewModel, ScheduleClassVm } from "../types";

interface ScheduleTableProps {
  profile: ProfileViewModel;
}

function classStyle(item: ScheduleClassVm) {
  if (item.scheduleType === "MAIN_SUBJECT") {
    return {
      bgcolor: "#fff7ed",
      color: "#ea580c",
      border: "1px solid #ffedd5",
      fontWeight: 600,
    };
  }
  return {
    bgcolor: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
    fontWeight: 500,
  };
}

export default function ScheduleTable({ profile }: ScheduleTableProps) {
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
            Thời khóa biểu
          </Typography>

          <TableContainer sx={{ borderRadius: 2, border: "1px solid #e5e7eb" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                  <TableCell
                    sx={{
                      minWidth: 130,
                      fontWeight: 700,
                      color: "#374151",
                      py: 1.5,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    Khung giờ
                  </TableCell>
                  {profile.dayHeaders.map((day) => (
                    <TableCell
                      key={day.id}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        minWidth: 140,
                        color: "#374151",
                        py: 1.5,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {day.short}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {profile.scheduleRows.map((row) => (
                  <TableRow
                    key={row.slot.id}
                    sx={{ "&:hover": { bgcolor: "#fafafa" } }}
                  >
                    <TableCell sx={{ py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                          {row.slot.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {row.slot.time}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {row.cells.map((cell) => (
                      <TableCell
                        key={`${row.slot.id}-${cell.dayId}`}
                        sx={{ py: 1.5, borderBottom: "1px solid #f3f4f6" }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.75}
                          useFlexGap
                          flexWrap="wrap"
                          justifyContent="center"
                        >
                          {cell.classes.map((item) => (
                            <Chip
                              key={item.id}
                              size="small"
                              label={`${item.subjectCode}`}
                              title={item.subjectName}
                              sx={classStyle(item)}
                            />
                          ))}
                          {cell.isFree && (
                            <Chip
                              size="small"
                              label="Rảnh"
                              sx={{
                                bgcolor: "#f0fdf4",
                                color: "#166534",
                                border: "1px solid #dcfce7",
                                fontWeight: 500,
                              }}
                            />
                          )}
                          {cell.classes.length === 0 && !cell.isFree && (
                            <Typography variant="caption" sx={{ color: "#d1d5db" }}>
                              -
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </CardContent>
    </Card>
  );
}
