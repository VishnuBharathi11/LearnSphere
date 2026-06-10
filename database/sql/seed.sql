USE learnsphere_db;

-- Clear previous data safely
DELETE FROM users;

-- Seed default users with BCrypt password hash of "password123"
INSERT INTO users (name, email, password, role, active, suspended)
VALUES
('Admin User', 'admin@learnsphere.com', '$2a$10$wS2WbTz3WzD1vG.h7m0eUunD6XbI11ZzB4H9mE5X2H9Q1X2M3S1m2', 'admin', true, false),
('Instructor User', 'inst@learnsphere.com', '$2a$10$wS2WbTz3WzD1vG.h7m0eUunD6XbI11ZzB4H9mE5X2H9Q1X2M3S1m2', 'instructor', true, false),
('Student User', 'student@learnsphere.com', '$2a$10$wS2WbTz3WzD1vG.h7m0eUunD6XbI11ZzB4H9mE5X2H9Q1X2M3S1m2', 'learner', true, false);

-- Seed default admin settings
DELETE FROM admin_settings;
INSERT INTO admin_settings (id, site_name, site_email, support_email, platform_fee_percent, min_course_price, max_course_price, user_registration, email_verification, course_reviews, discussions, auto_approve_instructors, auto_approve_courses, guest_browsing, maintenance_mode)
VALUES
(1, 'LearnSphere', 'admin@learnsphere.com', 'support@learnsphere.com', 10.0, 100, 10000, true, false, true, true, false, false, true, false);
