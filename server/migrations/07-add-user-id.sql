-- Migration để thêm cột user_id vào bảng rankings và typing_history

-- Thêm user_id vào rankings
ALTER TABLE rankings ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON rankings(user_id);

-- Thêm user_id vào typing_history  
ALTER TABLE typing_history ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_typing_history_user_id ON typing_history(user_id);
