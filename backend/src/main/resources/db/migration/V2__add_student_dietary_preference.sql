-- ==============================================================================
-- MessMap Database Schema Migration: V2__add_student_dietary_preference.sql
-- Description: Add dietary_preference column to users table for student profile
-- Compatible with MySQL 8.x and H2 in MySQL mode
-- ==============================================================================

ALTER TABLE users ADD COLUMN dietary_preference VARCHAR(30) DEFAULT 'VEG';
