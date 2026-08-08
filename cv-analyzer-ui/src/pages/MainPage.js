/* eslint-disable no-unused-vars */
import React from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import CustomDropzone from "../components/CustomDropzone";
import CvAnalysisModal from "../components/AnalysisModal";
import axios from "axios";
import ProfileMenu from "../components/ProfileMenu";
import { deleteCvService } from "../services/CvService";
import { useTranslation } from "react-i18next";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function MainPage() {
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [analysisData, setAnalysisData] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

 const handleFileSelect = async (file, onAnalysisFailed) => {
    if (!file || !file.id) return;

    try {
      await axios.post(
        `http://localhost:8080/api/v1/evaluations/analyze/${file.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return new Promise((resolve, reject) => {
        const client = new Client({
          brokerURL: "ws://localhost:8080/api/v1/ws",
          onConnect: () => {

            client.subscribe(`/topic/analysis/${file.id}`, (message) => {
              const body = message.body;

              if (body.startsWith("ERROR:")) {
                if (onAnalysisFailed) {
                  onAnalysisFailed(file.id);
                }
                setSnackbar({
                  open: true,
                  message: t("analysis_failed_deleting"),
                  severity: "error",
                });
                client.deactivate();
                reject(t("analysis_error"));
                return;
              }

              const resultData = JSON.parse(body);
              setAnalysisData(resultData);
              setModalOpen(true);

              client.deactivate();
              
              resolve(); 
            });
          },
          onStompError: (frame) => {
            if (onAnalysisFailed) onAnalysisFailed(file.id);
            client.deactivate();
            reject(t("websocket_error"));
          },
        });

        client.activate();
      });

    } catch (error) {
      alert(t("analysis_start_error"));
      throw error; 
    }
  };
  const handleAnalysisFailed = async (id, refreshList) => {
    setSnackbar({
      open: true,
      message: t("analysis_failed_deleting"),
      severity: "info",
    });

    setTimeout(async () => {
      try {
        await deleteCvService(id);

        if (refreshList) {
          refreshList();
        }
      } catch (e) {
      }
    }, 5000);
  };

  const handleInfoClick = async (id) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: t("analysis_not_completed"),
        severity: "info",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/evaluations/cv/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setAnalysisData(response.data);
      setModalOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("analysis_not_completed"),
        severity: "warning",
      });
    }
  };

  return (
    <Box>
      <Box>
        <ProfileMenu />
      </Box>

      <CustomDropzone
        onFileSelect={handleFileSelect}
        onInfoClick={handleInfoClick}
        onAnalysisFailed={handleAnalysisFailed}
      />

      <CvAnalysisModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={analysisData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
