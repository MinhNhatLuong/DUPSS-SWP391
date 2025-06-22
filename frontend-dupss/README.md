# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Cấu hình khi deploy

Khi deploy ứng dụng, bạn cần cấu hình URL API cho backend:

1. Tạo file `.env` trong thư mục gốc của dự án
2. Thêm dòng sau vào file `.env`:
   ```
   VITE_API_URL=https://api.yourdomain.com/api
   ```
3. Thay thế `https://api.yourdomain.com/api` bằng URL thực tế của backend API

Lưu ý: Trong môi trường phát triển, mặc định API URL là `http://localhost:8080/api`.
