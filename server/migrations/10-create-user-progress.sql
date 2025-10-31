-- Migration: Tạo bảng user_progress để lưu tiến độ gõ của người dùng
-- Lý do: Cho phép tạm dừng và tiếp tục gõ, cải thiện trải nghiệm người dùng

CREATE TABLE IF NOT EXISTS user_progress
(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER,
  verse_end INTEGER,
  current_word_index INTEGER DEFAULT 0,
  typed_text TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_time DATETIME,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_time_spent INTEGER DEFAULT 0, -- thời gian đã gõ (giây)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated ON user_progress(last_updated DESC);

-- Mỗi user chỉ có 1 progress active tại 1 thời điểm
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_active
ON user_progress(user_id) WHERE status = 'active';

-- Ví dụ insert
-- INSERT INTO user_progress(id, user_id, book_id, chapter, verse_start, verse_end, current_word_index, typed_text, status)
-- VALUES('progress-uuid', 'user-uuid', 1, 1, 1, 5, 10, 'Trong th', 'active');