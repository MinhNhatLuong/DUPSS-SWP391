import axios from 'axios';
import { API_URL } from './apiService';

// Tạo một axios instance với config chung
const api = axios.create({
  baseURL: API_URL,
});

// Biến để theo dõi trạng thái đang làm mới token
let isRefreshing = false;
// Mảng chứa các request đang chờ token mới
let refreshSubscribers = [];
// Biến để lưu thời gian hết hạn của token
let tokenExpiryTime = null;

// Hàm để subscribe các request đang chờ
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

// Hàm để thông báo cho các subscriber khi token mới có sẵn
const onRefreshed = (accessToken) => {
  refreshSubscribers.map(cb => cb(accessToken));
  refreshSubscribers = [];
};

// Hàm để phân tích token JWT và lấy thời gian hết hạn
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token', e);
    return null;
  }
};

// Hàm kiểm tra token có gần hết hạn chưa (dưới 30 giây)
const isTokenNearingExpiry = () => {
  if (!tokenExpiryTime) {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;
    
    const decodedToken = parseJwt(token);
    if (!decodedToken || !decodedToken.exp) return true;
    
    tokenExpiryTime = decodedToken.exp * 1000; // Convert to milliseconds
  }
  
  // Kiểm tra nếu token sắp hết hạn (còn dưới 30 giây)
  return Date.now() > tokenExpiryTime - 30000;
};

// Làm mới token từ refreshToken
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('Attempting to refresh token...');
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    
    // Lưu token mới vào localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    // Cập nhật thời gian hết hạn
    const decodedToken = parseJwt(newAccessToken);
    if (decodedToken && decodedToken.exp) {
      tokenExpiryTime = decodedToken.exp * 1000;
    }
    
    console.log('Token refreshed successfully');
    return newAccessToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Xóa token khi refresh thất bại
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    tokenExpiryTime = null;
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
        console.log('Token refresh failed, redirecting to login');
        
        // Lưu vị trí hiện tại để redirect sau khi đăng nhập lại
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        // Xóa token và thông báo đăng xuất
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        tokenExpiryTime = null;
        
        // Phát sự kiện session-expired để các component có thể phản ứng
        const sessionExpiredEvent = new CustomEvent('session-expired', {
          detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' }
        });
        document.dispatchEvent(sessionExpiredEvent);
        
        // Chuyển đến trang đăng nhập với thông tin phiên hết hạn
        if (window.location.pathname !== '/login') {
          // Sử dụng history.replaceState để không thêm vào history stack
          window.history.replaceState(
            { sessionExpired: true }, 
            '', 
            '/login'
          );
        window.location.href = '/login';
        }
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
  async config => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    // Nếu có token và token sắp hết hạn, thử làm mới token trước khi gửi request
    if (token && isTokenNearingExpiry() && !isRefreshing) {
      try {
        isRefreshing = true;
        const newToken = await refreshToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        isRefreshing = false;
      } catch (error) {
        console.error('Failed to refresh token on request:', error);
        isRefreshing = false;
      }
    } else if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

export default api;

// Các hàm helpers cho authentication
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  const { accessToken, refreshToken } = response.data;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Lưu thời gian hết hạn của token mới
  const decodedToken = parseJwt(accessToken);
  if (decodedToken && decodedToken.exp) {
    tokenExpiryTime = decodedToken.exp * 1000;
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  tokenExpiryTime = null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

// Lấy thông tin người dùng từ token JWT
export const getUserData = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  const decodedToken = parseJwt(token);
  if (!decodedToken) return null;
  
  return {
    id: decodedToken.userId, // Lấy userId từ token
    username: decodedToken.sub || decodedToken.username,
    email: decodedToken.email,
    roles: decodedToken.authorities || decodedToken.roles || []
  };
}; 