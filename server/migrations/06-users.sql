-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users
(
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tăng tốc độ tìm kiếm
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ví dụ insertion (password là "test123" đã được hash)
-- INSERT INTO users(id, username, email, password_hash, display_name, avatar_url, color)
-- VALUES('uuid-here', 'testuser', 'test@example.com', '$2a$10$...', 'Test User', 'https://...', '#3B82F6');
