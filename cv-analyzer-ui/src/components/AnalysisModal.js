/* eslint-disable no-unused-vars */
import React from "react";
import {
  Modal,
  Box,
  Typography,
  LinearProgress,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "600px",
  bgcolor: "var(--modal-bg)",
  color: "var(--text-primary)",
  borderRadius: "16px",
  boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.5)",
  outline: "none",
  p: { xs: 3, md: 4 },
};

export default function CvAnalysisModal({ open, onClose, data }) {
  const { t } = useTranslation();

  if (!data) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 50) return "#FF9800";
    return "#F44336";
  };

  const scoreColor = getScoreColor(data.score);

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <Box sx={modalStyle}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "var(--text-secondary)",
            "&:hover": {
              color: "var(--text-primary)",
              bgcolor: "var(--dropzone-bg)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 50,
              height: 50,
              display: "flex",
              borderRadius: "12px",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "var(--dropzone-bg)",
            }}
          >
            <PsychologyIcon
              sx={{ fontSize: 30, color: "var(--text-secondary)" }}
            />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              sx={{
                lineHeight: 1.2,
                color: "var(--text-primary)",
                fontSize: { xs: "1.5rem", md: "2.125rem" },
              }}
            >
              {t("modal_title")}
            </Typography>
            <Typography
              variant="subtitle1"
              component="p"
              fontWeight="bold"
              sx={{ color: "var(--text-secondary)" }}
            >
              {t("modal_subtitle")}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ mb: 1, color: "var(--text-secondary)" }}
        >
          {data.fileName || data.cvUpload?.fileName || " "}
        </Typography>

        <Box
          sx={{
            display: "inline-block",
            bgcolor: `color-mix(in srgb, ${scoreColor}, transparent 90%)`,
            px: 1.5,
            py: 0.5,
            borderRadius: "6px",
            mb: 1,
            border: `1px solid ${scoreColor}`,
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            sx={{ color: scoreColor }}
          >
            {t("score")}: {data.score}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={data.score}
          sx={{
            height: 8,
            borderRadius: 5,
            bgcolor: "var(--progressBar-bg)",
            mb: 4,
            "& .MuiLinearProgress-bar": {
              backgroundColor: scoreColor,
              borderRadius: 5,
            },
          }}
        />

        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "var(--text-primary)" }}
        >
          {t("modal_lead")}
        </Typography>

        <Box
          sx={{
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            backgroundColor: "var(--modalData-bg)",
            p: 2,
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            maxHeight: "200px",
            overflowY: "auto",
            fontSize: "0.875rem",
          }}
        >
          {data.analysisSummary}
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "var(--text-primary)" }}
        >
          {t("modal_recommendations")}
        </Typography>

        <Box
          sx={{
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            backgroundColor: "var(--modalData-bg)",
            p: 2,
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            maxHeight: "200px",
            overflowY: "auto",
            fontSize: "0.875rem",
          }}
        >
          {data.recommendations ? (
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {data.recommendations
                .split("- ")
                .filter((item) => item.trim() !== "")
                .map((item, index) => (
                  <li key={index} style={{ textAlign: "left" }}>
                    {item.trim()}
                  </li>
                ))}
            </ul>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {t("no_recommendations_available")}{" "}
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
