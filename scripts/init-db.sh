#!/bin/bash

# Script để khởi tạo các database SQLite với tất cả migrations

echo "Initializing SQLite databases..."

# Tạo thư mục db nếu chưa tồn tại
mkdir -p server/db

# Khởi tạo rankings database với tất cả migrations
if [ ! -f "server/db/rankings.sqlite" ]; then
    echo "Creating rankings database..."
    sqlite3 server/db/rankings.sqlite < server/migrations/04-rankings.sql
    sqlite3 server/db/rankings.sqlite < server/migrations/07-add-user-id.sql
    echo "✅ Rankings database created with all migrations"
else
    echo "⚠️  Rankings database already exists"
fi

# Khởi tạo typing-history database với tất cả migrations
if [ ! -f "server/db/typing-history.sqlite" ]; then
    echo "Creating typing-history database..."
    sqlite3 server/db/typing-history.sqlite < server/migrations/05-typing-history.sql
    sqlite3 server/db/typing-history.sqlite < server/migrations/07-add-user-id.sql
    sqlite3 server/db/typing-history.sqlite < server/migrations/08-add-best-wpm.sql
    sqlite3 server/db/typing-history.sqlite < server/migrations/09-drop-text-content.sql
    echo "✅ Typing history database created with all migrations"
else
    echo "⚠️  Typing history database already exists"
fi

# Khởi tạo users database với tất cả migrations
if [ ! -f "server/db/users.sqlite" ]; then
    echo "Creating users database..."
    sqlite3 server/db/users.sqlite < server/migrations/06-users.sql
    sqlite3 server/db/users.sqlite < server/migrations/10-create-user-progress.sql
    sqlite3 server/db/users.sqlite < server/migrations/11-add-progress-percentage.sql
    sqlite3 server/db/users.sqlite < server/migrations/12-add-text-length.sql
    sqlite3 server/db/users.sqlite < server/migrations/13-add-car.sql
    echo "✅ Users database created with all migrations"
else
    echo "⚠️  Users database already exists"
fi

echo ""
echo "✨ Database initialization complete!"
echo ""
echo "Databases created:"
echo "  - server/db/rankings.sqlite (with user_id)"
echo "  - server/db/typing-history.sqlite (with user_id, best_wpm, no text_content)"
echo "  - server/db/users.sqlite"
