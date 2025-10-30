-- DROP TABLE IF EXISTS typing_history;

CREATE TABLE IF NOT EXISTS typing_history
(
  id TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER,
  verse_end INTEGER,
  text_content TEXT NOT NULL,
  times_typed INTEGER DEFAULT 1,
  user_id TEXT,
  last_typed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tìm kiếm nhanh theo book, chapter, verses
CREATE INDEX IF NOT EXISTS idx_typing_history_verses 
ON typing_history(book_id, chapter, verse_start, verse_end);
CREATE INDEX IF NOT EXISTS idx_typing_history_user_id ON typing_history(user_id);

-- Ví dụ insertion
-- INSERT INTO typing_history(id, book_id, chapter, verse_start, verse_end, text_content, times_typed, user_id)
-- VALUES('uuid-here', 1, 1, 1, 3, 'Trong thời ban đầu...', 1, 'user-id-here');
