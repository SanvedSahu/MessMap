-- ==============================================================================
-- MessMap Database Schema Migration: V2__create_complaints_schema.sql
-- Description: Create complaints table for student grievances & admin moderation
-- Compatible with MySQL 8.x and ANSI SQL / H2 in MySQL mode
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Complaints Table
-- Preserves complaint history without cascading deletes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    mess_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_mess FOREIGN KEY (mess_id) REFERENCES messes (id),
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_complaints_ticket_number ON complaints(ticket_number);
CREATE INDEX idx_complaints_mess_id ON complaints(mess_id);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_severity ON complaints(severity);
