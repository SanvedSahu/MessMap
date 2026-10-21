-- ==============================================================================
-- Flyway Migration: V7__add_mess_removal_and_suspension_review_schema.sql
-- Adds removal_reason to messes table and creates suspension_review_requests
-- ==============================================================================

-- 1. Add removal_reason column to messes table for admin soft-removal
ALTER TABLE messes ADD COLUMN removal_reason VARCHAR(500) NULL;

-- 2. Create suspension_review_requests table for owner review submissions
CREATE TABLE IF NOT EXISTS suspension_review_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mess_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    explanation TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_srr_mess FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE,
    CONSTRAINT fk_srr_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_srr_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Indexes for high-performance lookup
CREATE INDEX idx_srr_mess_id ON suspension_review_requests(mess_id);
CREATE INDEX idx_srr_owner_id ON suspension_review_requests(owner_id);
CREATE INDEX idx_srr_status ON suspension_review_requests(status);
