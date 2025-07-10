import axios from 'axios';
import { API_URL } from './config';
import { getAccessToken, refreshAccessToken, logout } from '../utils/auth';

// Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor for adding auth token to requests
apiClient.interceptors.request.use(
  async config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor for handling token refresh on 401 errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // If token refreshed successfully, retry the original request
          const token = getAccessToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          // If refresh failed, logout but don't redirect
          logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If token refresh fails, logout but don't redirect
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 