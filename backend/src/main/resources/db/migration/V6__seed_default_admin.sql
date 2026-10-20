-- ==============================================================================
-- MessMap Database Schema Migration: V6__seed_default_admin.sql
-- Description: Seed Default Platform Administrator
-- Provides initial administrative credentials for campus governance & verification.
-- Compatible with MySQL 8.x and ANSI SQL / H2 in MySQL mode.
--
-- SECURITY NOTICE:
-- The default credentials (admin@messmap.com / admin) are strictly for controlled
-- development, testing, and evaluation demo environments.
-- For production environments, this seed must be replaced with secure provisioning
-- (e.g. environment variable-driven administrator creation) and the password
-- must be changed immediately upon deployment.
-- ==============================================================================

-- Safely insert the default administrator only if an account with this email
-- does not already exist, preserving any existing administrator's credentials and role.
INSERT INTO users (name, email, password, phone, role, status)
SELECT
    'Platform Administrator',
    'admin@messmap.com',
    '$2a$10$50qk/RegQVrEgcLOa1gJAeNfWD2u6NHylYElu1AweV8YvjIuutZiG',
    '+91 9999999999',
    'ROLE_ADMIN',
    'ACTIVE'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@messmap.com'
);
