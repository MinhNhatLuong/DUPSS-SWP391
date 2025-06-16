import axios from 'axios';

/**
 * Xóa token khỏi localStorage và đăng xuất người dùng
 * @param {function} callback - Hàm callback sẽ được gọi sau khi đăng xuất (tùy chọn)
 */
export const logout = (callback) => {
  // Xóa tất cả token lưu trong localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userInfo');
  
  // Gọi callback nếu có
  if (typeof callback === 'function') {
    callback();
  }
};

/**
 * Kiểm tra người dùng đã đăng nhập hay chưa
 * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

/**
 * Lấy token từ localStorage
 * @returns {string|null} - Access token hoặc null nếu không có
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Lấy refresh token từ localStorage
 * @returns {string|null} - Refresh token hoặc null nếu không có
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {Object} userInfo - Thông tin người dùng
 */
export const setUserInfo = (userInfo) => {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null} - Thông tin người dùng hoặc null nếu không có
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * Kiểm tra và làm mới token nếu cần
 * @returns {Promise<boolean>} - Promise trả về true nếu token hợp lệ hoặc đã được làm mới thành công
 */
export const checkAndRefreshToken = async () => {
  const accessToken = getAccessToken();
  
  if (!accessToken) return false;
  
  try {
    // Kiểm tra token hiện tại
    await axios.post('http://localhost:8080/api/auth/me', { accessToken });
    return true;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      // Token hết hạn, thử refresh
      return await refreshAccessToken();
    }
    return false;
  }
};

/**
 * Làm mới access token bằng refresh token
 * @returns {Promise<boolean>} - Promise trả về true nếu refresh thành công
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) return false;
  
  try {
    const response = await axios.post('http://localhost:8080/api/auth/refresh-token', {
      refreshToken
    });
    
    // Lưu token mới
    localStorage.setItem('accessToken', response.data.accessToken);
    return true;
  } catch (err) {
    // Refresh token không hợp lệ hoặc hết hạn
    logout();
    return false;
  }
}; 