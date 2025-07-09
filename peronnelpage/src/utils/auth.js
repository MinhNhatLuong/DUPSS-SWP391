import axios from 'axios';
import { API_URL } from '../services/config';

/**
 * Xóa token khỏi localStorage và đăng xuất người dùng
 * @param {function} callback - Hàm callback sẽ được gọi sau khi đăng xuất (tùy chọn)
 */
export const logout = async (callback) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      // Gọi API logout - truyền accessToken trong request body
      await axios.post(`${API_URL}/auth/logout`, { accessToken });
    }
    
    // Logout from Google if needed
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        // Signal to Google that the user has logged out
        window.google.accounts.id.disableAutoSelect();
        console.log('Google auto-select disabled');
      } catch (error) {
        console.error('Error when logging out from Google:', error);
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Xóa thông tin người dùng và token khỏi localStorage bất kể API call thành công hay thất bại
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    
    // Thực hiện callback để chuyển hướng người dùng
    if (callback && typeof callback === 'function') {
      callback();
    }
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
  // Đảm bảo lưu tất cả các trường từ API response
  const requiredFields = [
    'id', 
    'username', 
    'email', 
    'phone', 
    'fullName', 
    'gender',
    'yob', 
    'avatar', 
    'role',
    'address',
    'bio',
    'academicTitle',
    'certificates'
  ];
   
  // Lọc chỉ giữ lại các trường cần thiết từ đối tượng userInfo
  const filteredInfo = {};
  requiredFields.forEach(field => {
    if (userInfo[field] !== undefined) {
      filteredInfo[field] = userInfo[field];
    }
  });
   
  localStorage.setItem('userInfo', JSON.stringify(filteredInfo));
   
  // Kích hoạt sự kiện để thông báo cập nhật
  const event = new CustomEvent('user-info-updated');
  window.dispatchEvent(event);
};

/**
 * Lấy thông tin người dùng từ localStorage
 * @returns {Object|null} - Thông tin người dùng hoặc null nếu không tìm thấy
 */
export const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (!userInfoStr) return null;
   
  try {
    return JSON.parse(userInfoStr);
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
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
    await axios.post(`${API_URL}/auth/me`, { accessToken });
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
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {
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

/**
 * Cập nhật thông tin người dùng trong localStorage
 * @param {Object} profileData - Dữ liệu cập nhật
 */
export const updateUserProfile = (profileData) => {
  const currentInfo = getUserInfo();
  if (!currentInfo) return;
   
  // Kết hợp thông tin hiện tại với thông tin mới
  const updatedInfo = {
    ...currentInfo,
    ...profileData
  };
   
  // Lưu vào localStorage
  localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
   
  // Kích hoạt sự kiện custom để các component khác (như Header) biết có sự thay đổi
  const event = new CustomEvent('user-profile-updated', {
    detail: updatedInfo
  });
  document.dispatchEvent(event);
}; 