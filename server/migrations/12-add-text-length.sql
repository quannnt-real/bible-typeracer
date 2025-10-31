-- Migration: Thêm cột text_length vào bảng user_progress
-- Lý do: Lưu độ dài text để tính toán progress percentage chính xác

ALTER TABLE user_progress ADD COLUMN text_length INTEGER DEFAULT 0;