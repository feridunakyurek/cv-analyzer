import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import LogIn from "./pages/LogIn";
import { Box } from "@mui/material";
import MainPage from "./pages/MainPage";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ThemeSwitcher from "./components/ThemeSwitcher";

function App() {
  const { t } = useTranslation();

  const location = useLocation();

  return (
    <div className="split-container">
      <aside className="left-side">
        <div className="top-bar">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="left-content">
          <h1 className="brand">IntelliHire</h1>

          <div className="subtitle">
            <div>
              {t("title_pre")}&nbsp;&nbsp;
              <span>{t("title_highlight")}</span>&nbsp;&nbsp;
              {t("title_post")}
            </div>
            <div>{t("title_sub")}</div>
          </div>

          <p className="lead">{t("lead")}</p>

          <div className="left-footer">
            Developed with Spring Boot &amp; React | Powered by OpenAI
          </div>
        </div>
      </aside>

      <main className="right-side">
        <Box>
          <Routes location={location}>
            <Route path="/" element={<LogIn />} />
            <Route
              path="/mainpage"
              element={
                <ProtectedRoute>
                  <MainPage />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Box>
      </main>
    </div>
  );
}

export default App;
