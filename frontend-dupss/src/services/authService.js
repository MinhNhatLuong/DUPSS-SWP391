import axios from 'axios';

// Tạo một axios instance với config chung
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Biến để theo dõi trạng thái đang làm mới token
let isRefreshing = false;
// Mảng chứa các request đang chờ token mới
let refreshSubscribers = [];

// Hàm để subscribe các request đang chờ
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

// Hàm để thông báo cho các subscriber khi token mới có sẵn
const onRefreshed = (accessToken) => {
  refreshSubscribers.map(cb => cb(accessToken));
  refreshSubscribers = [];
};

// Làm mới token từ refreshToken
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('http://localhost:8080/api/auth/refresh-token', { refreshToken });
    
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    
    // Lưu token mới vào localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Xóa token khi refresh thất bại
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Thêm interceptor response để xử lý lỗi 401 và tự động làm mới token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Nếu lỗi là 401 và chưa thử làm mới token trước đó
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang làm mới token, thêm request hiện tại vào hàng đợi
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Đánh dấu là đang làm mới token và đã thử làm mới cho request hiện tại
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Làm mới token
        const newToken = await refreshToken();
        
        // Cập nhật header cho request ban đầu
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Thông báo cho các request đang chờ
        onRefreshed(newToken);
        
        // Thử lại request ban đầu với token mới
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu làm mới token thất bại, chuyển hướng người dùng đến trang đăng nhập
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Thêm interceptor request để tự động thêm token vào header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;

// Các hàm helpers cho authentication
export const login = async (credentials) => {
  const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
  const { accessToken, refreshToken } = response.data;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
}; 