#!/bin/bash

echo "📥 Downloading Bible database..."

# Download VIE2010.sqlite from a reliable source
# You can upload this file to your own storage and update the URL
curl -L "https://example.com/VIE2010.sqlite" -o server/db/VIE2010.sqlite

echo "✅ Database downloaded successfully!"

echo "🗄️  Initializing other databases..."
# Create empty databases that will be initialized by the app
touch server/db/rankings.sqlite
touch server/db/typing-history.sqlite
touch server/db/users.sqlite

echo "🎯 Run 'npm run init-db' to initialize the databases"