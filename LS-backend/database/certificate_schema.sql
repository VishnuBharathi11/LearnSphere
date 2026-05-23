CREATE DATABASE IF NOT EXISTS learnsphere_db;
USE learnsphere_db;

CREATE TABLE IF NOT EXISTS certificate_templates (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(140) NOT NULL,
  component_key VARCHAR(60) NOT NULL,
  format VARCHAR(24) NOT NULL,
  theme VARCHAR(24) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  default_template BOOLEAN NOT NULL DEFAULT FALSE,
  design_config_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_templates_active_default (active, default_template)
);

CREATE TABLE IF NOT EXISTS certificates (
  id CHAR(36) PRIMARY KEY,
  student_user_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(160) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  course_title VARCHAR(180) NOT NULL,
  instructor_name VARCHAR(160),
  instructor_signature_url VARCHAR(512),
  skill_badges_json JSON NULL,
  template_id CHAR(36) NOT NULL,
  verification_token VARCHAR(96) NOT NULL UNIQUE,
  verification_url VARCHAR(1024) NOT NULL,
  pdf_storage_key VARCHAR(1024) NOT NULL,
  pdf_download_url VARCHAR(1024) NOT NULL,
  qr_code_data_uri TEXT,
  status VARCHAR(24) NOT NULL,
  issued_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cert_template FOREIGN KEY (template_id) REFERENCES certificate_templates(id),
  UNIQUE KEY uq_cert_student_course (student_user_id, course_id),
  INDEX idx_cert_user (student_user_id),
  INDEX idx_cert_course (course_id),
  INDEX idx_cert_verification_token (verification_token)
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  certificate_id CHAR(36) NULL,
  token VARCHAR(96) NOT NULL,
  valid BOOLEAN NOT NULL,
  ip_address VARCHAR(64),
  user_agent VARCHAR(512),
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_certificate FOREIGN KEY (certificate_id) REFERENCES certificates(id),
  INDEX idx_verification_certificate (certificate_id),
  INDEX idx_verification_token (token),
  INDEX idx_verification_checked_at (checked_at)
);
