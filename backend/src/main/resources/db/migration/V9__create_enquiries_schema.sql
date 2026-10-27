-- ==============================================================================
-- Flyway Migration: V9__create_enquiries_schema.sql
-- Description: Create customer enquiries table for student-to-mess communications
-- Compatible with MySQL 8.x and H2 (MySQL mode)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mess_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(150),
    student_phone VARCHAR(20),
    student_college VARCHAR(150),
    category VARCHAR(50) NOT NULL,
    plan_type VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    reply_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enquiries_mess FOREIGN KEY (mess_id) REFERENCES messes (id) ON DELETE CASCADE,
    CONSTRAINT fk_enquiries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_enquiries_mess_id ON enquiries(mess_id);
CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at);
