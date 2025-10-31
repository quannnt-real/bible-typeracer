-- Migration to add car column to users table

ALTER TABLE users ADD COLUMN car TEXT DEFAULT 'car-icon.svg';