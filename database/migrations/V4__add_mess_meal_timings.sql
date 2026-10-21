-- ==============================================================================
-- MessMap Database Schema Migration: V4__add_mess_meal_timings.sql
-- Description: Add meal timings columns to messes table for breakfast, lunch, and dinner
-- Compatible with MySQL 8.x and H2 (MySQL mode)
-- ==============================================================================

ALTER TABLE messes ADD COLUMN breakfast_timing VARCHAR(50);
ALTER TABLE messes ADD COLUMN lunch_timing VARCHAR(50);
ALTER TABLE messes ADD COLUMN dinner_timing VARCHAR(50);
