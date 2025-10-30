#!/bin/bash

# Script để khởi tạo các database SQLite

echo "Initializing SQLite databases..."

# Tạo thư mục db nếu chưa tồn tại
mkdir -p server/db

# Khởi tạo rankings database
if [ ! -f "server/db/rankings.sqlite" ]; then
    echo "Creating rankings database..."
    sqlite3 server/db/rankings.sqlite < server/migrations/04-rankings.sql
    echo "✅ Rankings database created"
else
    echo "⚠️  Rankings database already exists"
fi

# Khởi tạo typing-history database
if [ ! -f "server/db/typing-history.sqlite" ]; then
    echo "Creating typing-history database..."
    sqlite3 server/db/typing-history.sqlite < server/migrations/05-typing-history.sql
    echo "✅ Typing history database created"
else
    echo "⚠️  Typing history database already exists"
fi

echo ""
echo "✨ Database initialization complete!"
echo ""
echo "Databases created:"
echo "  - server/db/rankings.sqlite"
echo "  - server/db/typing-history.sqlite"
