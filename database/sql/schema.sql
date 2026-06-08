CREATE DATABASE IF NOT EXISTS learnsphere_db;
USE learnsphere_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(30),
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'learner',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  bio TEXT,
  expertise VARCHAR(255),
  experience VARCHAR(255),
  linkedin VARCHAR(255),
  portfolio VARCHAR(255),
  professional_website VARCHAR(255),
  profile_image LONGTEXT
);

-- 2. Instructor Applications Table
CREATE TABLE IF NOT EXISTS instructor_applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  expertise VARCHAR(255) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  date_of_birth DATE NOT NULL,
  linkedin VARCHAR(1000),
  resume_file_name VARCHAR(255),
  resume_content_type VARCHAR(100),
  resume_data LONGBLOB,
  status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by VARCHAR(120)
);

-- 3. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(120) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  status VARCHAR(24) NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment_user_course (user_id, course_id)
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY,
  user_id VARCHAR(120) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  razorpay_order_id VARCHAR(120) UNIQUE NOT NULL,
  razorpayment_id VARCHAR(120),
  amount INT NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(24) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  instructor_id VARCHAR(120) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  payout_method VARCHAR(50) NOT NULL,
  account_holder_name VARCHAR(120),
  bank_name VARCHAR(120),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  upi_id VARCHAR(120),
  note VARCHAR(800),
  course_ids VARCHAR(4000),
  status VARCHAR(24) NOT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGINT PRIMARY KEY,
  site_name VARCHAR(100),
  site_email VARCHAR(120),
  support_email VARCHAR(120),
  platform_fee_percent DOUBLE,
  min_course_price INT,
  max_course_price INT,
  user_registration BOOLEAN DEFAULT TRUE,
  email_verification BOOLEAN DEFAULT FALSE,
  course_reviews BOOLEAN DEFAULT TRUE,
  discussions BOOLEAN DEFAULT TRUE,
  auto_approve_instructors BOOLEAN DEFAULT FALSE,
  auto_approve_courses BOOLEAN DEFAULT FALSE,
  guest_browsing BOOLEAN DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(50) UNIQUE NOT NULL,
  permissions_json VARCHAR(4000),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Analytics Stats Tables
CREATE TABLE IF NOT EXISTS user_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  total_users BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payment_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  total_revenue DOUBLE DEFAULT 0.0,
  total_enrollments BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS course_stats (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  total_courses BIGINT DEFAULT 0,
  published_courses BIGINT DEFAULT 0,
  pending_courses BIGINT DEFAULT 0
);