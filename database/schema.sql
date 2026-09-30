-- RadioNitroz Studio Console — schema
-- Import via phpMyAdmin or: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS radionitroz_studio;
USE radionitroz_studio;

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  show_id INT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  booked_by INT DEFAULT NULL,
  status ENUM('open', 'booked') NOT NULL DEFAULT 'open',
  FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  slot_id INT DEFAULT NULL,
  content_title VARCHAR(150) NOT NULL,
  content_notes TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by INT DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES members(id) ON DELETE SET NULL
);

-- Seed one admin. Password is "admin123" for local testing only.
-- This hash was generated and verified with password_verify() before being
-- committed here. Change the password immediately on any real deployment:
-- run `php -r "echo password_hash('yourpassword', PASSWORD_DEFAULT);"`
-- and paste the result into this table, or add a change-password endpoint.
INSERT INTO members (name, email, password_hash, role)
VALUES ('Studio Admin', 'admin@radionitroz.local', '$2y$10$KlkSs4ttr70YibpmBJySVenvB7ZeJGJxq55UXgX0VbHJzG..9u8/q', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Sample show + slots so the pages have data on first run
INSERT INTO shows (title, description, created_by) VALUES
  ('Wavecraze Live', 'Weekly fest coverage and interviews', 1);

INSERT INTO slots (show_id, slot_date, start_time, end_time) VALUES
  (1, CURDATE() + INTERVAL 1 DAY, '10:00:00', '11:00:00'),
  (1, CURDATE() + INTERVAL 1 DAY, '11:00:00', '12:00:00'),
  (1, CURDATE() + INTERVAL 2 DAY, '14:00:00', '15:00:00');
