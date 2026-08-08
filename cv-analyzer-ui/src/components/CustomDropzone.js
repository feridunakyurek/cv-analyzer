/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import "../styles/CustomDropzone.css";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  CircularProgress,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import {
  uploadCvService,
  deleteCvService,
  getMyCvsService,
  deleteEvaluationService,
} from "../services/CvService";
import { useNavigate } from "react-router";
import InfoIcon from "@mui/icons-material/Info";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function CustomDropzone({
  onFileSelect,
  onInfoClick,
  onAnalysisFailed,
}) {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [analyzingId, setAnalyzingId] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach((file) => {
      const tempId = `${file.name}-${Date.now()}`;

      setFiles((prev) => [
        ...prev,
        {
          id: tempId,
          file,
          name: file.name,
          size: file.size,
          status: "loading",
          progress: 0,
        },
      ]);

      // Call service
      uploadCvService(file, (progressPercent) => {
        // Progress update
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, progress: progressPercent } : f,
          ),
        );
      }).then((result) => {
        if (result.success) {
          const returned = result.data || {};
          const realId = returned.id || tempId;

          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    id: returned.id || tempId,
                    status: "complete",
                    progress: 100,
                    remote: !!returned.id,
                  }
                : f,
            ),
          );

          if (onFileSelect && returned.id) {
            setAnalyzingId((prev) => [...prev, realId]);

            onFileSelect(returned, (id) => onAnalysisFailed(id, fetchMyCvs))
              .then(() => {
                setAnalyzingId((prev) => prev.filter((id) => id !== realId));
                fetchMyCvs();
              })
              .catch(() => {
                setAnalyzingId((prev) => prev.filter((id) => id !== realId));
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === realId
                      ? {
                          ...f,
                          status: "info",
                          error: t("service_error"),
                        }
                      : f,
                  ),
                );
              });
          } else {
            fetchMyCvs();
          }

          //try {
          //  fetchMyCvs();
          //} catch {}
        } else {
          // Failed upload
          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    status: "failed",
                    progress: 100,
                    error: result.error,
                  }
                : f,
            ),
          );

          setTimeout(() => {
            setFiles((prev) => prev.filter((f) => f.id !== tempId));
          }, 5000);
        }
      });
    });

    rejectedFiles.forEach((r) => {
      const rejectedId = `${r.file.name}-${Date.now()}`;
      setFiles((prev) => [
        ...prev,
        {
          id: rejectedId,
          file: r.file,
          name: r.file.name,
          size: r.file.size,
          status: "failed",
          progress: 100,
          error: r.errors[0]?.message || t("invalid_file"),
        },
      ]);
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.id !== rejectedId));
      }, 5000);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
  });

const handleRemove = async (id) => {
  const fileToRemove = files.find((f) => f.id === id);
  if(fileToRemove && fileToRemove.status === "failed") {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    return;
  }
    try {
      await deleteEvaluationService(id);
      await deleteCvService(id);
    } catch (error) {
      console.warn("Sunucudan silinirken hata oluştu (Dosya sunucuda olmayabilir).");
    } finally {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      
      setSnackbar({
        open: true,
        message: t("delete_success"),
        severity: "success",
      });
    }
  };

  const fetchMyCvs = () => {
    let mounted = true;

    setTimeout(() => {
      getMyCvsService().then((result) => {
        if (!mounted) return;

        if (result.success) {
          const list = result.data.map((item) => ({
            id:
              item.id ||
              item._id ||
              item.filename ||
              item.fileId ||
              item.name ||
              Date.now().toString(),
            name:
              item.name ||
              item.originalName ||
              item.filename ||
              item.fileName ||
              "Unnamed",
            size: item.size || item.fileSize || 0,
            status: "complete",
            progress: 100,
            remote: true,
          }));

          setFiles((prev) => {
            const localPending = prev.filter(
              (p) => !p.remote && p.status !== "complete",
            );
            return [...list, ...localPending];
          });
        }
      });
    }, 500);

    return () => (mounted = false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const cleanup = fetchMyCvs();
    return cleanup;
  }, []);

  return (
    <Box>
      <Paper
        className={`dropzone ${isDragActive ? "active" : ""}`}
        {...getRootProps()}
        sx={{
          bgcolor: "var(--dropzone-bg)",
          borderColor: "var(--dropzone-border)",
          color: "var(--text-secondary)",
        }}
      >
        <input {...getInputProps()} />
        <UploadFileRoundedIcon
          className="upload-icon"
          sx={{ color: "var(--text-secondary)", fontSize: 48, mb: 2 }}
        />
        <Typography variant="h6" color="var(--text-primary)">
          <strong>{t("upload_title")}</strong>
        </Typography>
        <Typography variant="body2" color="var(--text-secondary)">
          <strong>{t("upload_desc")}</strong>
        </Typography>
      </Paper>

      <Box className="files">
        {files.map((f, index) => {
          // 1. Dinamik renkleri belirliyoruz (Hem çerçeve hem de "Tamamlandı" yazısı için)
          let dynamicColor = "var(--glass-border)"; // Varsayılan renk

          if (f.status === "failed" || f.status === "info") {
            dynamicColor = "#EF5350"; // Hatalarda KIRMIZI
          } else if (f.status === "complete" && !analyzingId.includes(f.id)) {
            dynamicColor = "#81C784"; // Başarılıysa YEŞİL
          } else if (f.status === "loading" || analyzingId.includes(f.id)) {
            dynamicColor = "#64B5F6"; // İşlem sürüyorsa MAVİ
          }

          return (
            <Box
              key={index}
              className="files-element"
              // 🟢 KESİN ÇÖZÜM: CSS dosyasını ezmek için 'style' kullanıyoruz
              style={{
                borderColor: dynamicColor,
              }}
              sx={{
                bgcolor: "var(--modalData-bg)",
                border: "1px solid", // Sadece kalınlık ve stili belirttik, rengi üstteki 'style' devralacak
                color: "var(--text-primary)",
                transition: "border-color 0.3s ease",
              }}
            >
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                {(() => {
                  const displayName = f.name || "Unnamed";
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          f.status === "failed" || f.status === "info"
                            ? 600
                            : 400,
                        color:
                          f.status === "failed" || f.status === "info"
                            ? "error.main"
                            : "var(--text-primary)",
                      }}
                    >
                      {f.status === "failed"
                        ? t("upload_failed")
                        : displayName.length > 40
                          ? displayName.substring(0, 37) + "..."
                          : displayName}
                    </Typography>
                  );
                })()}

                {/* 🟢 METİN RENGİ DÜZELTİLDİ: Artık gri değil, çerçevenin rengiyle (Yeşil/Kırmızı/Mavi) aynı olacak */}
                <Typography variant="caption" sx={{ color: dynamicColor }}>
                  {((f.size || 0) / 1024).toFixed(0)} KB •{" "}
                  {f.status === "failed"
                    ? f.error || t("upload_failed")
                    : f.status === "info"
                      ? f.error || t("analysis_error")
                      : f.status === "loading"
                        ? t("loading")
                        : analyzingId.includes(f.id)
                          ? t("analysis")
                          : t("completed")}
                  {f.status === "failed" ? ` (${t("invalid_type_msg")})` : ""}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={
                    f.status === "complete" ||
                    f.status === "failed" ||
                    f.status === "info"
                      ? 100
                      : 60
                  }
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: "var(--progressBar-bg)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: dynamicColor, // Bar rengi de eşitlendi
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title={t("delete_file")}>
                  <IconButton onClick={() => handleRemove(f.id)}>
                    <DeleteIcon
                      sx={{
                        color: "var(--text-secondary)",
                        "&:hover": { color: "error.main" },
                      }}
                    />
                  </IconButton>
                </Tooltip>

                {analyzingId.includes(f.id) ? (
                  <Tooltip title={t("icon_title")}>
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-flex",
                        p: 1,
                      }}
                    >
                      <CircularProgress size={24} sx={{ color: "#4fc3f7" }} />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AutoAwesomeIcon
                          sx={{ fontSize: 14, color: "var(--text-primary)" }}
                        />
                      </Box>
                    </Box>
                  </Tooltip>
                ) : (
                  f.status === "complete" && (
                    <Tooltip title={t("analysis_result")}>
                      <IconButton
                        onClick={() => {
                          onInfoClick(f.id);
                        }}
                      >
                        <InfoIcon
                          sx={{
                            color: "var(--text-secondary)",
                            "&:hover": { color: "#29b6f6" },
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
