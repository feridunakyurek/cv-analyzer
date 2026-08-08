import axios from "axios";

const API_URL = "http://localhost:8080/api/cv";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadCvService = async (file, onProgress) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return { success: false, error: "Kullanıcı doğrulanmadı." };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await axios.post(
      "http://localhost:8080/api/cv/upload",
      formData,
      { headers, }
    );

    return {
      success: true,
      data: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message || "Yükleme hatası"
    };
  }
};

export const deleteEvaluationService = async (id) => {
  if (!id) {
    return {
      success: false,
      error: "Silinecek değerlendirme ID'si bulunamadı.",
    };
  }
  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    return {
      success: false,
      error: "Kullanıcı doğrulanmadı. Lütfen giriş yapın.",
    };
  }

  try {
    await axios.delete(`http://localhost:8080/api/v1/evaluations/delete/${id}`, { headers });
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.message ||
        err.message ||
        "Değerlendirme silinirken bir hata oluştu.",
    };
  }

}

export const deleteCvService = async (id) => {
  if (!id) {
    return {
      success: false,
      error: "Silinecek dosya ID'si bulunamadı.",
    };
  }

  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    return {
      success: false,
      error: "Kullanıcı doğrulanmadı. Lütfen giriş yapın.",
    };
  }

  try {
    await axios.delete(`${API_URL}/delete/${id}`, { headers });

    return {
      success: true,
    };

  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.message ||
        err.message ||
        "Dosya silinirken bir hata oluştu.",
    };
  }
};

export const getMyCvsService = async () => {
  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    return { success: false, error: "Kullanıcı doğrulanmadı." };
  }

  try {
    const response = await axios.get(`${API_URL}/user/my-cvs`, { headers });

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.message ||
        err.message ||
        "CV listesi alınırken hata oluştu.",
    };
  }
};

export const analyzeCvService = async (cvId) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await axios.post(
      `http://localhost:8080/api/v1/evaluations/analyze/${cvId}`,
      {},
      { headers }
    );

    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message || "Analiz yapılamadı."
    };
  }
};

export const getEvaluationResultService = async (cvId) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await axios.get(
      `http://localhost:8080/api/v1/evaluations/cv/${cvId}`,
      { headers }
    );
    return { success: true, data: res.data };
  } catch (err) {
    // 404 dönerse bu bir hata değil, "Yapay Zeka hala çalışıyor" demektir.
    if (err.response && err.response.status === 404) {
      return { success: false, status: 404 };
    }
    return { success: false, error: "Sonuç alınırken hata oluştu." };
  }
};
