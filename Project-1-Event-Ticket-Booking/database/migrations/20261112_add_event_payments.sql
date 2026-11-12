USE event_ticket_booking;

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

INSERT INTO event_payments (booking_id, receipt_number, amount, payment_status, payment_method, email_status)
SELECT b.id,
       CONCAT('TN26-', LPAD(b.id, 10, '0')),
       b.total_amount,
       'PENDING',
       'SIMULATED',
       'NOT_SENT'
FROM event_bookings b
LEFT JOIN event_payments p ON p.booking_id = b.id
WHERE p.id IS NULL;
