import api from './authService';
import { showErrorAlert } from '../components/common/AlertNotification';
import { API_URL } from './config';

/**
 * API Service - Cung cấp các phương thức để gọi API với xử lý lỗi và refresh token
 * Sử dụng instance api từ authService để tận dụng cơ chế refresh token
 */

// Re-export để các component khác không cần thay đổi
export { API_URL };

// Lưu trữ yêu cầu gọi lại nếu token hết hạn
const storeRedirectAfterLogin = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== '/login') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
};

// Xử lý lỗi chung
const handleApiError = (error, defaultMessage = 'Đã xảy ra lỗi, vui lòng thử lại sau.') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Lỗi server trả về
    console.error('Error response:', error.response);
    
    // Xử lý lỗi 401 Unauthorized
    if (error.response.status === 401) {
      storeRedirectAfterLogin();
      showErrorAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return;
    }
    
    // Xử lý các lỗi khác từ server
    const errorMessage = error.response.data?.message || defaultMessage;
    showErrorAlert(errorMessage);
  } else if (error.request) {
    // Không nhận được response
    console.error('Error request:', error.request);
    showErrorAlert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
  } else {
    // Lỗi khác
    showErrorAlert(defaultMessage);
  }
};

/**
 * Các hàm gọi API
 */

// GET request
export const apiGet = async (endpoint, params = {}, showError = true) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// POST request
export const apiPost = async (endpoint, data = {}, showError = true) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// PUT request
export const apiPut = async (endpoint, data = {}, showError = true) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// DELETE request
export const apiDelete = async (endpoint, showError = true) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// PATCH request
export const apiPatch = async (endpoint, data = {}, showError = true) => {
  try {
    const response = await api.patch(endpoint, data);
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// Upload file
export const apiUpload = async (endpoint, formData, showError = true) => {
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

// Public API (không cần token)
export const apiPublicGet = async (endpoint, params = {}, showError = true) => {
  try {
    const response = await api.get(`/public${endpoint}`, { params });
    return response.data;
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
    throw error;
  }
};

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  patch: apiPatch,
  upload: apiUpload,
  publicGet: apiPublicGet
}; 