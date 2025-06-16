/**
 * Xóa token khỏi localStorage và đăng xuất người dùng
 * @param {function} callback - Hàm callback sẽ được gọi sau khi đăng xuất (tùy chọn)
 */
export const logout = (callback) => {
  // Xóa tất cả token lưu trong localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
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