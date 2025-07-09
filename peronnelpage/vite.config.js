// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//         secure: false
//       }
//     }
//   }
// })
// deloy
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép nhận kết nối từ bên ngoài (IP/domain)
    port: 3000, // Đảm bảo Vite chạy đúng cổng bạn dùng
    allowedHosts: ['admin.dupssapp.id.vn'], // Chỉ cho phép domain admin truy cập
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Proxy sang backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})

