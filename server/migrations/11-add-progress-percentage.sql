-- Migration: Thêm cột progress_percentage vào bảng user_progress
-- Lý do: Lưu phần trăm hoàn thành dựa trên thanh tiến trình để hiển thị chính xác

ALTER TABLE user_progress ADD COLUMN progress_percentage INTEGER DEFAULT 0;

-- Cập nhật dữ liệu hiện có (ước tính dựa trên current_word_index)
UPDATE user_progress SET progress_percentage = (current_word_index * 100) / 120 WHERE progress_percentage = 0;