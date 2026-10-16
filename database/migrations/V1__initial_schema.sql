-- ==============================================================================
-- MessMap Database Schema Migration: V1__initial_schema.sql
-- Database: messmap_db
-- Description: Initial schema for Core Entities (Users, Messes, Facilities, Menus, Reviews, Favorites)
-- Compatible with MySQL 8.x and ANSI SQL / H2 in MySQL mode
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Users Table
-- Supports Student, Mess Owner, and Admin roles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    college VARCHAR(150),
    hostel VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ------------------------------------------------------------------------------
-- 2. Messes Table
-- Campus mess and tiffin services registered by owners, subject to admin approval
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(150),
    address VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    food_type VARCHAR(50) NOT NULL DEFAULT 'VEG_AND_NON_VEG',
    daily_price DECIMAL(8, 2),
    monthly_price DECIMAL(8, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    operating_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    opening_time VARCHAR(20),
    closing_time VARCHAR(20),
    rejection_reason VARCHAR(255),
    hero_image VARCHAR(500),
    capacity INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messes_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE INDEX idx_messes_owner_id ON messes(owner_id);
CREATE INDEX idx_messes_status ON messes(status);
CREATE INDEX idx_messes_city ON messes(city);
CREATE INDEX idx_messes_area ON messes(area);
CREATE INDEX idx_messes_food_type ON messes(food_type);

-- ------------------------------------------------------------------------------
-- 3. Facilities Table
-- Standard mess amenities (e.g., WiFi, RO Water, AC Dining)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50)
);

-- ------------------------------------------------------------------------------
-- 4. Mess Facilities Join Table (Many-to-Many)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mess_facilities (
    mess_id BIGINT NOT NULL,
    facility_id BIGINT NOT NULL,
    PRIMARY KEY (mess_id, facility_id),
    CONSTRAINT fk_mf_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE,
    CONSTRAINT fk_mf_facility FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 5. Mess Images Table
-- Gallery and showcase photographs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mess_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mess_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    caption VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE
);

CREATE INDEX idx_mess_images_mess_id ON mess_images(mess_id);

-- ------------------------------------------------------------------------------
-- 6. Menu Items Table
-- Daily and recurring dishes offered by each mess
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mess_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255),
    meal_type VARCHAR(30) NOT NULL,
    price DECIMAL(8, 2),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    day_of_week VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_items_mess_id ON menu_items(mess_id);
CREATE INDEX idx_menu_items_meal_type ON menu_items(meal_type);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);

-- ------------------------------------------------------------------------------
-- 7. Reviews Table
-- Ratings and feedback submitted by students
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    mess_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    food_quality_score INT,
    hygiene_score INT,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_mess_id ON reviews(mess_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ------------------------------------------------------------------------------
-- 8. Favorites Table
-- Saved messes for student quick-access
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    mess_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE,
    CONSTRAINT uk_favorites_user_mess UNIQUE (user_id, mess_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_mess_id ON favorites(mess_id);

-- ------------------------------------------------------------------------------
-- 9. Seed Standard Amenities
-- ------------------------------------------------------------------------------
INSERT INTO facilities (name, icon) VALUES
('WiFi', 'wifi'),
('RO Purified Water', 'droplet'),
('Hot Water', 'flame'),
('AC Dining', 'wind'),
('Parking Space', 'car'),
('CCTV Security', 'shield');
