INSERT INTO roles (name) VALUES
('admin'),
('instructor'),
('learner');

INSERT INTO users (name,email,password,role_id)
VALUES
('Admin','admin@learnsphere.com','hashedpwd',1),
('Instructor','inst@learnsphere.com','hashedpwd',2),
('Student','student@learnsphere.com','hashedpwd',3);

INSERT INTO categories (name,description) VALUES
('Web Development','Frontend & backend'),
('Data Science','ML & AI'),
('Mobile Development','Android & iOS');
