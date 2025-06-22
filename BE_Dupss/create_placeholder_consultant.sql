-- Kiểm tra xem consultant với ID=2 đã tồn tại chưa
SET @exists = (SELECT COUNT(*) FROM consultants WHERE id = 2);

-- Nếu chưa tồn tại, thêm consultant placeholder
INSERT INTO consultants (id, fullname, email, password, enabled, specialization)
SELECT 2, 'Placeholder', 'placeholder@example.com', '$2a$10$1/CiDnkVCVCxH4HGtYtFZeYY7CMXdCZpLdJCQ0lKNbxEBi3ywZTlC', 1, 'Placeholder'
WHERE @exists = 0;

-- Chú ý: Password là 'placeholder' đã được mã hóa bằng BCrypt
-- Bạn có thể thay đổi các giá trị khác cho phù hợp với cấu trúc bảng consultants của bạn 