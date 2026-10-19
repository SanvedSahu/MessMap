-- ==============================================================================
-- MessMap Database Schema Migration: V5__add_menu_item_special_and_meal_pricing.sql
-- Description: Add meal pricing columns to messes table and is_special to menu_items
-- Compatible with MySQL 8.x and H2 (MySQL mode)
-- ==============================================================================

ALTER TABLE messes ADD COLUMN breakfast_price DECIMAL(8, 2);
ALTER TABLE messes ADD COLUMN lunch_price DECIMAL(8, 2);
ALTER TABLE messes ADD COLUMN dinner_price DECIMAL(8, 2);

ALTER TABLE menu_items ADD COLUMN is_special BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_menu_items_day_of_week ON menu_items(day_of_week);
