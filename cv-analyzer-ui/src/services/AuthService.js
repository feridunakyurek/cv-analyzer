import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/auth";

export const loginService = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return {
      success: true,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: "Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.",
    };
  }
};

export const registerService = async (name, surname, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      surname,
      email,
      password,
    });

    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return {
      success: true,
      token: response.data.token,
      message: "Kayıt işlemi başarıyla tamamlandı.",
    };
  } catch (error) {
    const backendMessage = error.response?.data?.message;

    return {
      success: false,
      message:
        backendMessage || "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
};

export const getUserProfileService = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false };

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Profil bilgileri alınamadı:", error);
    return { success: false, error: error.message };
  }
};

export const deleteAccountService = async () => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false };

  try {
    await axios.delete(`${API_URL}/delete-account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Hesap silinemedi:", error);
    return { success: false, error: error.message };
  }
};

export const changePasswordService = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("token");
  if (!token) return { success: false, error: "Oturum bulunamadı." };

  try {
    const response = await axios.post(`${API_URL}/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, message: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || "Şifre değiştirme hatası.",
    };
  }
};
