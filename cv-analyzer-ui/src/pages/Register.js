/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import { Container, Box, Button, TextField, Alert, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { registerService } from "../services/AuthService";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [token, setToken] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleShowPassword1 = () => setShowPassword1((prev) => !prev);
  const handleShowPassword2 = () => setShowPassword2((prev) => !prev);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    let isValid = true;
    const { name, surname, email, password, password2 } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = t("required_mail");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = t("valid_mail");
      isValid = false;
    }

    if (!password) {
      newErrors.password = t("enter_password");
      isValid = false;
    }

    if (password !== password2) {
      newErrors.password2 = t("errors_password_confirm");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    const { name, surname, email, password } = formData;
    const result = await registerService(name, surname, email, password);

    if (result.success) {
      setToken(result.token);
      localStorage.setItem("token", result.token);

      setMessage({
        type: "success",
        text: t("success_register"),
      });

      setTimeout(() => {
        navigate("/mainpage");
      }, 1500);
    } else {
      setMessage({
        type: "error",
        text: result.message || t("errors_register"),
      });
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box className="register-container">
        
        <h2 className="register-title">{t("register")}</h2>
        <div className="register-divider" />

        <Box className="name-row">
          <TextField
            className="register-field"
            label={t("name")}
            name="name"
            id="name"
            variant="filled"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            className="register-field"
            name="surname"
            id="surname"
            variant="filled"
            label={t("surname")}
            fullWidth
            value={formData.surname}
            onChange={handleChange}
            error={!!errors.surname}
            helperText={errors.surname}
          />
        </Box>

        <TextField
          className="register-field"
          label={t("email")}
          type="email"
          name="email"
          id="email"
          variant="filled"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          className="register-field"
          label={t("password")}
          type={showPassword1 ? "text" : "password"}
          name="password"
          id="password"
          variant="filled"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleShowPassword1}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  className="password-toggle-icon"
                >
                  {showPassword1 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          className="register-field"
          label={t("password2")}
          type={showPassword2 ? "text" : "password"}
          name="password2"
          id="password2"
          variant="filled"
          fullWidth
          value={formData.password2}
          onChange={handleChange}
          error={!!errors.password2}
          helperText={errors.password2}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleShowPassword2}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  className="password-toggle-icon"
                >
                  {showPassword2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box className="register-buttons">
          <Button
            className="register-submit-button"
            onClick={handleSubmit}
            disabled={loading}
            size="large"
            variant="contained"
            fullWidth
          >
            <strong>{t("register")}</strong>
          </Button>
        </Box>

        <Typography className="login-redirect-text">
          {t("has_account") || "Already have an account?"}{" "}
          <a href="/" className="ref-link">
            {t("login")}
          </a>
        </Typography>

        {message && (
          <Alert 
            severity={message.type} 
            variant="filled"
            className="register-alert"
          >
            {message.text}
          </Alert>
        )}
      </Box>
    </Container>
  );
}