/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Alert,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import {
  getUserProfileService,
  deleteAccountService,
  changePasswordService,
} from "../services/AuthService";

// CSS Dosyasını import ediyoruz
import "../styles/ProfileMenu.css";

export default function ProfileMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [changePassOpen, setChangePassOpen] = useState(false);
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passMessage, setPassMessage] = useState(null);
  const [passErrors, setPassErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    fullName: localStorage.getItem("fullName") || t("user"),
    email: localStorage.getItem("userEmail") || " ",
  });

  const [showPassword1, setShowPassword1] = React.useState(false);
  const [showPassword2, setShowPassword2] = React.useState(false);
  const [showPassword3, setShowPassword3] = React.useState(false);

  const [logoutSnackbarOpen, setLogoutSnackbarOpen] = useState(false);

  const handleShowPassword1 = () => setShowPassword1((prev) => !prev);
  const handleShowPassword2 = () => setShowPassword2((prev) => !prev);
  const handleShowPassword3 = () => setShowPassword3((prev) => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getUserProfileService();
      if (result.success) {
        const { fullName, email } = result.data;
        setUserData({ fullName, email });
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("userEmail", email);
      }
    };
    fetchProfile();
  }, []);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    setLogoutSnackbarOpen(true);
    setTimeout(() => {
      localStorage.clear();
      navigate("/");
    }, 2000);
  };

  const openDeleteDialog = () => {
    handleClose();
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  const openChangePassDialog = () => {
    handleClose();
    setPassData({ current: "", new: "", confirm: "" });
    setPassMessage(null);
    setChangePassOpen(true);
  };

  const closeChangePassDialog = () => setChangePassOpen(false);

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData({ ...passData, [name]: value });
    if (passErrors[name]) {
      setPassErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validatePassword = () => {
    let errors = {};
    let isValid = true;

    if (!passData.current) {
      errors.current = t("errors_passowrd_current");
      isValid = false;
    }
    if (!passData.new) {
      errors.new = t("errors_passowrd_new");
      isValid = false;
    }
    if (passData.new !== passData.confirm) {
      errors.confirm = t("errors_passowrd_confirm");
      isValid = false;
    }
    setPassErrors(errors);
    return isValid;
  };

  const handleSubmitPassword = async () => {
    setPassMessage(null);
    if (!validatePassword()) return;

    setLoading(true);
    const result = await changePasswordService(passData.current, passData.new);

    if (result.success) {
      setPassMessage({
        type: "success",
        text: t("changed_password"),
      });
      setTimeout(() => closeChangePassDialog(), 1500);
    } else {
      if (result.error.includes(t("current"))) {
        setPassErrors({ current: t("current_password_error") });
      } else {
        setPassMessage({ type: "error", text: result.error });
      }
    }
    setLoading(false);
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccountService();

    if (result.success) {
      localStorage.clear();
      navigate("/");
    } else {
      alert(t("delete_account_error"));
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box className="profile-menu-container">
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar className="profile-avatar">
          <PersonIcon className="profile-avatar-icon" />
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            className: "account-menu-paper",
            elevation: 0,
          },
        }}
      >
        <Box className="menu-user-info">
          <Typography variant="subtitle1" noWrap fontWeight="bold">
            {userData.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {userData.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={openChangePassDialog}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" className="menu-icon" />
          </ListItemIcon>
          <ListItemText>{t("change_password")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" className="menu-icon" />
          </ListItemIcon>
          <ListItemText>{t("logout")}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={openDeleteDialog} className="menu-item-delete">
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t("delete_account")} />
        </MenuItem>
      </Menu>

      {/* --- SİLME DİYALOĞU --- */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        slotProps={{
          paper: { className: "custom-dialog-paper" },
          backdrop: { className: "custom-backdrop" },
        }}
      >
        <DialogTitle
          className="dialog-title-error"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <WarningAmberIcon />
          {t("delete_account_title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="dialog-text">
            {t("delete_account_subtitle")}
            <br />
            <br />
            <strong>{t("continue")}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            color="primary"
            disabled={isDeleting}
            className="btn-cancel"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isDeleting ? t("being_deleted") : t("delete_account")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- ŞİFRE DEĞİŞTİRME DİYALOĞU --- */}
      <Dialog
        open={changePassOpen}
        onClose={closeChangePassDialog}
        slotProps={{
          paper: { className: "custom-dialog-paper" },
          backdrop: { className: "custom-backdrop-heavy" },
        }}
      >
        <DialogTitle className="dialog-title">
           <LockResetIcon sx={{ mr: 1 }} /> {t("change_password")}
        </DialogTitle>

        <DialogContent>
          <Box component="form" className="password-form-container">
            {/* Inputlara 'profile-input' class'ı verdik, CSS'te ayarlayacağız */}
            <TextField
              label={t("current_password")}
              type={showPassword1 ? "text" : "password"}
              name="current"
              fullWidth
              className="profile-input" 
              variant="filled"
              onChange={handlePassChange}
              error={!!passErrors.current}
              helperText={passErrors.current}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword1}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("new_password")}
              type={showPassword2 ? "text" : "password"}
              name="new"
              fullWidth
              className="profile-input"
              variant="filled"
              value={passData.new}
              onChange={handlePassChange}
              error={!!passErrors.new}
              helperText={passErrors.new}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword2}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("new_password2")}
              type={showPassword3 ? "text" : "password"}
              name="confirm"
              fullWidth
              className="profile-input"
              variant="filled"
              value={passData.confirm}
              onChange={handlePassChange}
              error={!!passErrors.confirm}
              helperText={passErrors.confirm}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleShowPassword3}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword3 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {passMessage && (
              <Alert severity={passMessage.type} sx={{ mt: 1 }}>
                {passMessage.text}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeChangePassDialog} className="btn-cancel">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmitPassword}
            variant="contained"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? t("being_changed") : t("change")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={logoutSnackbarOpen}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" className="alert-full-width">
          {t("logout_confirm")}
        </Alert>
      </Snackbar>
    </Box>
  );
}