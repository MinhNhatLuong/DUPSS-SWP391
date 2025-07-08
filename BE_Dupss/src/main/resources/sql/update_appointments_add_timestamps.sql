-- Script để thêm cột created_at và updated_at vào bảng appointments
-- và cập nhật dữ liệu hiện có

-- Thêm cột created_at và updated_at nếu chưa tồn tại
-- (Hibernate sẽ tự động thêm khi khởi động với ddl-auto: update)

-- Cập nhật created_at cho các bản ghi hiện có (nếu chưa có giá trị)
-- Sử dụng appointment_date và appointment_time để ước tính thời gian tạo
UPDATE appointments 
SET created_at = TIMESTAMP(appointment_date, appointment_time) - INTERVAL 1 HOUR
WHERE created_at IS NULL;

-- Cập nhật updated_at cho các bản ghi hiện có
UPDATE appointments 
SET updated_at = NOW()
WHERE updated_at IS NULL;
