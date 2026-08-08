/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import "../styles/LogIn.css"
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, Button, Container, Alert, Snackbar } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import { loginService } from "../services/AuthService";

export default function LogIn() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await loginService(email, password);

    if (result.success) {
      localStorage.setItem("token", result.token);

      setSnackbar({
        open: true,
        message: t('login_confirm'),
        severity: "success",
      });

      setTimeout(() => {
        navigate("/mainpage");
      }, 1500);
    } else {
      setSnackbar({
        open: true,
        message: t("login_error"),
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box className="login-container">

        <h2 className="login-title">{t('login')} </h2>
        <div className="login-divider" />

        <TextField
          className="login-field"
          label={t('email')} 
          id="login-email"
          type="email"
          fullWidth
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          className="login-field"
          label={t('password')} 
          id="login-password"
          variant="filled"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                sx={{
                  color:"#071024"
                }}
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          className="login-buttons"
        >
          <Button
            className= "google-button"
            variant="contained"
            startIcon={<FcGoogle />}
          >
           <strong>{t('login_google')}</strong> 
          </Button>

          <Button
            className="login-button"
            size="small"
            variant="contained"
            onClick={handleLogin}
          >
            <strong>{t('login')} </strong>
          </Button>
          
        </Box>

        <p className="register-line">
          {t('no_account')} 
          <a href="/register" className="ref-link">
            {t('register')} 
          </a>
        </p>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ mt: 2, mr: 2, color: "var(--text-primary)" }}
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
    </Container>
  );
}
