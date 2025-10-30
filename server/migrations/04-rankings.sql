-- DROP TABLE IF EXISTS rankings;

CREATE TABLE IF NOT EXISTS rankings
(
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  score_wpm INTEGER NOT NULL,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tăng tốc độ query theo score
CREATE INDEX IF NOT EXISTS idx_rankings_score ON rankings(score_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON rankings(user_id);

-- Ví dụ insertion
-- INSERT INTO rankings(id, nickname, score_wpm, user_id)
-- VALUES('745bfc8c-3c05-48d3-8e67-85d69b8f2476', 'Tchoupinax', 50, 'user-id-here');
