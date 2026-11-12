CREATE DATABASE IF NOT EXISTS event_ticket_booking;
USE event_ticket_booking;

CREATE TABLE IF NOT EXISTS event_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  account_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_sessions_account
    FOREIGN KEY (account_id) REFERENCES event_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NULL,
  tickets INT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  total_amount DECIMAL(10,2) NOT NULL,
  attendee_type VARCHAR(30) NOT NULL DEFAULT 'Student',
  access_pass VARCHAR(30) NOT NULL DEFAULT 'Standard',
  seat_zone VARCHAR(30) NOT NULL DEFAULT 'Mid Hall',
  add_ons TEXT NULL,
  special_notes VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_bookings_account
    FOREIGN KEY (user_id) REFERENCES event_accounts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  receipt_number VARCHAR(32) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('PENDING', 'CONFIRMED') NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(30) NOT NULL DEFAULT 'SIMULATED',
  confirmed_at DATETIME NULL,
  email_status ENUM('NOT_SENT', 'SENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'NOT_SENT',
  email_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  email_attempt_started_at DATETIME NULL,
  email_sent_at DATETIME NULL,
  email_last_error VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_payments_booking (booking_id),
  UNIQUE KEY uq_event_payments_receipt (receipt_number),
  KEY idx_event_payments_email_delivery (email_status, email_attempt_started_at),
  CONSTRAINT fk_event_payments_booking
    FOREIGN KEY (booking_id) REFERENCES event_bookings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  initial_tickets INT NOT NULL DEFAULT 100
);

INSERT INTO event_settings (ticket_price, initial_tickets)
SELECT 100.00, 100
WHERE NOT EXISTS (SELECT 1 FROM event_settings);
