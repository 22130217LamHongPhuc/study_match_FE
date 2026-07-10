import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createReport,
  getReportErrorMessage,
  isDuplicateReportResponse,
  ReportReason,
  ReportTargetType,
} from "../../services/reportApi";

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
  targetName?: string;
  onSuccess?: () => void;
};

const REPORT_TITLES: Record<ReportTargetType, string> = {
  USER: "Báo cáo người dùng",
  POST: "Báo cáo bài viết",
  GROUP: "Báo cáo nhóm",
};

const TARGET_LABELS: Record<ReportTargetType, string> = {
  USER: "Người dùng",
  POST: "Bài viết",
  GROUP: "Nhóm",
};

const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Quấy rối" },
  { value: "INAPPROPRIATE_CONTENT", label: "Nội dung không phù hợp" },
  { value: "FAKE_INFORMATION", label: "Giả mạo thông tin" },
  { value: "SCAM", label: "Lừa đảo" },
  { value: "CHEATING", label: "Gian lận học tập" },
  { value: "OTHER", label: "Khác" },
];

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setReason("");
    setDescription("");
    setReasonError("");
    setSubmitting(false);
  }, [open, targetId, targetType]);

  const handleClose = () => {
    if (submitting) return;
    setReason("");
    setDescription("");
    setReasonError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!reason) {
      setReasonError("Vui lòng chọn lý do báo cáo.");
      return;
    }

    setSubmitting(true);
    setReasonError("");

    try {
      const response = await createReport({
        targetType,
        targetId,
        reason,
        description: description.trim(),
      });

      if (response.success) {
        toast.success("Báo cáo đã được gửi cho admin xử lý.");
        setReason("");
        setDescription("");
        setReasonError("");
        onClose();
        onSuccess?.();
        return;
      }

      if (isDuplicateReportResponse(response)) {
        toast.info("Bạn đã báo cáo đối tượng này trước đó.");
        return;
      }

      toast.error(getReportErrorMessage(response));
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Không thể gửi báo cáo. Vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, dialogReason) => {
        if (
          submitting &&
          (dialogReason === "backdropClick" ||
            dialogReason === "escapeKeyDown")
        ) {
          return;
        }
        handleClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "18px",
          maxWidth: 560,
          width: "95%",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.25,
          borderBottom: "1px solid #f1f5f9",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: "999px",
            bgcolor: "#f0f7ff",
            color: "#2563eb",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />
          Báo cáo
        </Box>
        <Typography
          sx={{
            mt: 1.5,
            fontSize: 22,
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1.2,
            pr: 5,
          }}
        >
          {REPORT_TITLES[targetType]}
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: 460,
          }}
        >
          Hãy cho admin biết vấn đề bạn gặp phải. Báo cáo sẽ được xem xét trước
          khi xử lý.
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          size="small"
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#64748b",
            bgcolor: "#f8fafc",
            "&:hover": { bgcolor: "#e2e8f0" },
            "&.Mui-disabled": { bgcolor: "#f8fafc", color: "#cbd5e1" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        {targetName ? (
          <Box
            sx={{
              mb: 2.5,
              borderRadius: "12px",
              border: "1px solid #bae2fd",
              bgcolor: "#f0f7ff",
              px: 2,
              py: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1e40af",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {TARGET_LABELS[targetType]}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 14,
                fontWeight: 700,
                color: "#1e3a8a",
                wordBreak: "break-word",
              }}
            >
              {targetName}
            </Typography>
          </Box>
        ) : null}

        <TextField
          select
          fullWidth
          label="Lý do báo cáo"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value as ReportReason | "");
            setReasonError("");
          }}
          disabled={submitting}
          error={Boolean(reasonError)}
          helperText={
            reasonError || "Chọn lý do phù hợp nhất với trường hợp này."
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              bgcolor: "#fff",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#38bdf8" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb" },
            },
          }}
        >
          <MenuItem value="" disabled>
            Chọn lý do báo cáo
          </MenuItem>
          {REPORT_REASON_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ mt: 2.5 }}>
          <Typography
            sx={{
              mb: 1,
              fontSize: 14,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            Mô tả thêm
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={submitting}
            placeholder="Mô tả thêm vấn đề nếu cần..."
            inputProps={{ maxLength: 1000 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                alignItems: "flex-start",
                bgcolor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#38bdf8" },
                "&.Mui-focused fieldset": {
                  borderColor: "#2563eb",
                  bgcolor: "#fff",
                },
              },
            }}
          />
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
              Mô tả chi tiết sẽ giúp admin xử lý nhanh và chính xác hơn.
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                whiteSpace: "nowrap",
              }}
            >
              {description.length}/1000
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={submitting}
          variant="outlined"
          sx={{
            minWidth: 110,
            borderRadius: "10px",
            borderColor: "#cbd5e1",
            color: "#475569",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              borderColor: "#94a3b8",
              bgcolor: "#f8fafc",
            },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          sx={{
            minWidth: 140,
            borderRadius: "10px",
            bgcolor: "#2563eb",
            color: "#fff",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 10px 20px rgba(37,99,235,0.18)",
            "&:hover": { bgcolor: "#1d4ed8" },
            "&.Mui-disabled": {
              bgcolor: "#bae2fd",
              color: "#fff",
            },
          }}
        >
          {submitting ? (
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} sx={{ color: "#fff" }} />
              Đang gửi...
            </Box>
          ) : (
            "Gửi báo cáo"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
