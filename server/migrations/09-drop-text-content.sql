-- Migration: Remove text_content column from typing_history table
-- Reason: text_content is redundant and causes unnecessary data bloat
-- We can fetch text content from the Bible database using book_id, chapter, verse_start, verse_end

-- First, backup the data (optional - uncomment if you want to keep a backup)
-- CREATE TABLE typing_history_backup AS SELECT * FROM typing_history;

-- Drop the text_content column
ALTER TABLE typing_history DROP COLUMN text_content;

-- Verify the change
-- PRAGMA table_info(typing_history);