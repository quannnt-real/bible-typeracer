-- Migration to add best_wpm column to typing_history table

ALTER TABLE typing_history ADD COLUMN best_wpm INTEGER DEFAULT 0;

-- Update existing records to have a default WPM (optional)
-- UPDATE typing_history SET best_wpm = 0 WHERE best_wpm IS NULL;