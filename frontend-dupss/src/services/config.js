/**
 * Config - Chứa các cấu hình chung của ứng dụng
 */

// Cấu hình API URL - Dễ dàng thay đổi khi deploy
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'; 