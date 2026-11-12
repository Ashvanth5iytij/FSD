const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const { promisify } = require('util');
const { buildReceiptEmail, createReceiptPdf, formatReceiptNumber } = require('./lib/paymentReceipt');

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist'), { index: false }));
const scrypt = promisify(crypto.scrypt);

const dbName = process.env.DB_NAME || 'event_ticket_booking';
const PORT = process.env.PORT || 5000;
const databaseOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const EVENT_CONFIG = {
  name: 'TechNova 2026 – Department Technical Fest',
  department: 'Department of Computer Science and Engineering',
  dateTime: 'Dec 12, 2026 · 10:00 AM',
  venue: 'Vel Tech, Chennai',
  ticketPrice: 100,
  initialTickets: 100,
};

let databaseAvailable = false;
let pool = null;

async function createDatabaseIfNeeded() {
  const connection = await mysql.createConnection(databaseOptions);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  } finally {
    await connection.end();
  }
}

function buildDatabasePool() {
  return mysql.createPool({
    ...databaseOptions,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

async function initializeDatabase() {
  try {
    await createDatabaseIfNeeded();
    pool = buildDatabasePool();

    const [paymentTable] = await pool.query("SHOW TABLES LIKE 'event_payments'");
    if (!paymentTable.length) {
      throw new Error('Payment schema is missing. Apply database/migrations/20261112_add_event_payments.sql before starting the application.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        department VARCHAR(100) NOT NULL,
        tickets INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        initial_tickets INT NOT NULL DEFAULT 100
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_salt VARCHAR(64) NOT NULL,
        password_hash VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_sessions (
        token_hash CHAR(64) PRIMARY KEY,
        account_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_event_sessions_account
          FOREIGN KEY (account_id) REFERENCES event_accounts(id) ON DELETE CASCADE
      )
    `);

    const [bookingColumns] = await pool.query('SHOW COLUMNS FROM event_bookings');
    const existingColumns = new Set(bookingColumns.map((column) => column.Field));
    const additionalColumns = {
      user_id: 'INT NULL',
      phone: 'VARCHAR(30) NULL',
      ticket_price: 'DECIMAL(10,2) NOT NULL DEFAULT 100.00',
      attendee_type: "VARCHAR(30) NOT NULL DEFAULT 'Student'",
      access_pass: "VARCHAR(30) NOT NULL DEFAULT 'Standard'",
      seat_zone: "VARCHAR(30) NOT NULL DEFAULT 'Mid Hall'",
      add_ons: 'TEXT NULL',
      special_notes: 'VARCHAR(500) NULL',
    };

    for (const [column, definition] of Object.entries(additionalColumns)) {
      if (!existingColumns.has(column)) {
        await pool.query(`ALTER TABLE event_bookings ADD COLUMN ${column} ${definition}`);
      }
    }

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM event_settings');
    if (rows[0].count === 0) {
      await pool.query(
        'INSERT INTO event_settings (ticket_price, initial_tickets) VALUES (?, ?)',
        [EVENT_CONFIG.ticketPrice, EVENT_CONFIG.initialTickets]
      );
    }

    databaseAvailable = true;
    console.log('Database connected successfully.');
  } catch (error) {
    databaseAvailable = false;
    pool = null;
    throw new Error(`MySQL is required for persistent accounts and bookings: ${error.message}`);
  }
}

async function getAvailableTickets() {
  const [rows] = await pool.query(
    'SELECT COALESCE(SUM(tickets), 0) AS sold FROM event_bookings'
  );
  const sold = Number(rows[0].sold || 0);
  const [settings] = await pool.query(
    'SELECT initial_tickets, ticket_price FROM event_settings ORDER BY id DESC LIMIT 1'
  );
  const initialTickets = settings.length ? Number(settings[0].initial_tickets) : EVENT_CONFIG.initialTickets;
  return {
    availableTickets: Math.max(0, initialTickets - sold),
    ticketPrice: settings.length ? Number(settings[0].ticket_price) : EVENT_CONFIG.ticketPrice,
  };
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || '';
  const match = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

async function getAccount(req) {
  const token = getCookie(req, 'event_session');
  if (!token || !pool) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const [rows] = await pool.query(
    `SELECT a.id, a.name, a.email
     FROM event_sessions s
     JOIN event_accounts a ON a.id = s.account_id
     WHERE s.token_hash = ? AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

function setSessionCookie(res, token) {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `event_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`
  );
}

function clearSessionCookie(res) {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', `event_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

async function createSession(accountId, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await pool.query('DELETE FROM event_sessions WHERE expires_at <= NOW()');
  await pool.query(
    'INSERT INTO event_sessions (token_hash, account_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))',
    [tokenHash, accountId]
  );
  setSessionCookie(res, token);
}

function presentBooking(row, eventName = EVENT_CONFIG.name) {
  if (!row) return null;
  return {
    bookingId: `BK${String(row.id).padStart(6, '0')}`,
    name: row.name,
    email: row.email,
    phone: row.phone,
    department: row.department,
    eventName,
    tickets: Number(row.tickets),
    ticketPrice: Number(row.ticket_price || EVENT_CONFIG.ticketPrice),
    totalAmount: Number(row.total_amount),
    eventDateTime: EVENT_CONFIG.dateTime,
    venue: EVENT_CONFIG.venue,
    attendeeType: row.attendee_type,
    accessPass: row.access_pass,
    seatZone: row.seat_zone,
    addOns: row.add_ons ? JSON.parse(row.add_ons) : [],
    specialNotes: row.special_notes || '',
    createdAt: row.created_at,
    paymentStatus: row.payment_status || 'PENDING',
    receiptNumber: row.receipt_number || null,
    paymentMethod: row.payment_method || 'SIMULATED',
    confirmedAt: row.confirmed_at || null,
    emailStatus: row.email_status || 'NOT_SENT',
    emailAttempts: Number(row.email_attempts || 0),
    emailAttemptStartedAt: row.email_attempt_started_at || null,
    emailLastError: row.email_last_error || null,
  };
}

async function getOwnedBookingReceipt(accountId, bookingId, executor = pool) {
  const match = /^BK(\d+)$/.exec(bookingId);
  if (!match) return null;
  const [rows] = await executor.query(
    `SELECT b.id, b.user_id, b.name, b.email, b.department, b.phone, b.tickets, b.total_amount, b.ticket_price,
            b.created_at, b.attendee_type, b.access_pass, b.seat_zone, b.add_ons, b.special_notes,
            p.receipt_number, p.amount, p.payment_status, p.payment_method, p.confirmed_at,
            p.email_status, p.email_attempts, p.email_attempt_started_at, p.email_last_error
     FROM event_bookings b
     LEFT JOIN event_payments p ON p.booking_id = b.id
     WHERE b.id = ? AND b.user_id = ? LIMIT 1`,
    [Number(match[1]), accountId]
  );
  return rows[0] || null;
}

function getSmtpConfiguration() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD
    || !process.env.SMTP_FROM || !Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }
  return {
    host: process.env.SMTP_HOST,
    port,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    from: process.env.SMTP_FROM,
  };
}

async function sendReceiptEmail(bookingId, accountId) {
  const row = await getOwnedBookingReceipt(accountId, bookingId);
  if (!row) return { emailStatus: 'NOT_FOUND' };
  if (row.payment_status !== 'CONFIRMED') return { emailStatus: row.email_status || 'NOT_SENT' };

  const [claim] = await pool.query(
    `UPDATE event_payments
     SET email_status = 'SENDING', email_attempts = email_attempts + 1,
         email_attempt_started_at = NOW(), email_last_error = NULL
     WHERE booking_id = ? AND payment_status = 'CONFIRMED'
       AND (email_status IN ('NOT_SENT', 'FAILED')
         OR (email_status = 'SENDING' AND email_attempt_started_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)))`,
    [row.id]
  );
  if (claim.affectedRows !== 1) {
    const [current] = await pool.query(
      'SELECT email_status FROM event_payments WHERE booking_id = ? LIMIT 1',
      [row.id]
    );
    return { emailStatus: current[0]?.email_status || 'NOT_SENT', alreadySent: current[0]?.email_status === 'SENT' };
  }

  const smtp = getSmtpConfiguration();
  if (!smtp) {
    await pool.query(
      `UPDATE event_payments SET email_status = 'FAILED', email_last_error = ?
       WHERE booking_id = ? AND email_status = 'SENDING'`,
      ['SMTP is not configured. Add the SMTP environment variables and retry.', row.id]
    );
    return { emailStatus: 'FAILED' };
  }

  const receipt = presentBooking(row);
  receipt.totalAmount = Number(row.amount);
  try {
    const pdf = await createReceiptPdf(receipt);
    const message = buildReceiptEmail(receipt);
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    await transporter.sendMail({
      from: smtp.from,
      to: receipt.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: [{
        filename: `TechNova-${receipt.receiptNumber}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      }],
    });
    await pool.query(
      `UPDATE event_payments
       SET email_status = 'SENT', email_sent_at = NOW(), email_last_error = NULL
       WHERE booking_id = ? AND email_status = 'SENDING'`,
      [row.id]
    );
    return { emailStatus: 'SENT' };
  } catch (error) {
    console.error('Receipt email delivery failed:', error.code || 'SMTP error');
    await pool.query(
      `UPDATE event_payments
       SET email_status = 'FAILED', email_last_error = ?
       WHERE booking_id = ? AND email_status = 'SENDING'`,
      ['Receipt email delivery failed. You can safely retry.', row.id]
    );
    return { emailStatus: 'FAILED' };
  }
}

app.post('/api/register', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Enter a name between 2 and 100 characters.' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = await scrypt(password, salt, 64);
    const [result] = await pool.query(
      'INSERT INTO event_accounts (name, email, password_salt, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, salt, passwordHash.toString('hex')]
    );
    await createSession(result.insertId, res);
    return res.status(201).json({ user: { id: result.insertId, name, email } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Unable to create your account. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const [rows] = await pool.query(
      'SELECT id, name, email, password_salt, password_hash FROM event_accounts WHERE email = ? LIMIT 1',
      [email]
    );
    const account = rows[0];
    if (!account || !password) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const actualHash = await scrypt(password, account.password_salt, 64);
    const expectedHash = Buffer.from(account.password_hash, 'hex');
    if (actualHash.length !== expectedHash.length || !crypto.timingSafeEqual(actualHash, expectedHash)) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    await createSession(account.id, res);
    return res.json({ user: { id: account.id, name: account.name, email: account.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to sign in. Please try again.' });
  }
});

app.get('/api/session', async (req, res) => {
  try {
    const user = await getAccount(req);
    return res.json({ user: user ? { id: user.id, name: user.name, email: user.email } : null });
  } catch (error) {
    console.error('Session lookup error:', error);
    return res.status(500).json({ message: 'Unable to check your sign-in status.' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    const token = getCookie(req, 'event_session');
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await pool.query('DELETE FROM event_sessions WHERE token_hash = ?', [tokenHash]);
    }
    clearSessionCookie(res);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Unable to sign out. Please try again.' });
  }
});

app.get('/api/event', async (req, res) => {
  try {
    const { availableTickets, ticketPrice } = await getAvailableTickets();
    res.json({
      ...EVENT_CONFIG,
      ticketPrice,
      availableTickets,
      initialTickets: EVENT_CONFIG.initialTickets,
    });
  } catch (error) {
    console.error('Error loading event:', error);
    res.status(500).json({ message: 'Unable to load event details.' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to view your bookings.' });
    const [rows] = await pool.query(
      `SELECT b.id, b.name, b.email, b.department, b.phone, b.tickets, b.total_amount, b.ticket_price, b.created_at,
              b.attendee_type, b.access_pass, b.seat_zone, b.add_ons, b.special_notes,
              p.receipt_number, p.payment_status, p.payment_method, p.confirmed_at,
              p.email_status, p.email_attempts, p.email_attempt_started_at, p.email_last_error
       FROM event_bookings b
       LEFT JOIN event_payments p ON p.booking_id = b.id
       WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 100`,
      [account.id]
    );
    return res.json(rows.map((row) => presentBooking(row)));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Unable to fetch bookings.' });
  }
});

app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to view your booking.' });
    const match = /^BK(\d+)$/.exec(req.params.bookingId);
    if (!match) return res.status(404).json({ message: 'Booking not found.' });
    const [rows] = await pool.query(
      `SELECT b.id, b.name, b.email, b.department, b.phone, b.tickets, b.total_amount, b.ticket_price, b.created_at,
              b.attendee_type, b.access_pass, b.seat_zone, b.add_ons, b.special_notes,
              p.receipt_number, p.payment_status, p.payment_method, p.confirmed_at,
              p.email_status, p.email_attempts, p.email_attempt_started_at, p.email_last_error
       FROM event_bookings b
       LEFT JOIN event_payments p ON p.booking_id = b.id
       WHERE b.id = ? AND b.user_id = ? LIMIT 1`,
      [Number(match[1]), account.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found.' });
    return res.json(presentBooking(rows[0]));
  } catch (error) {
    console.error('Booking lookup error:', error);
    return res.status(500).json({ message: 'Unable to load this booking.' });
  }
});

app.post('/api/bookings/:bookingId/payment/confirm', async (req, res) => {
  let connection;
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to confirm your payment.' });
    if (req.body?.confirm !== true) {
      return res.status(400).json({ message: 'Confirm the simulated payment to continue. No real payment is processed.' });
    }

    const match = /^BK(\d+)$/.exec(req.params.bookingId);
    if (!match) return res.status(404).json({ message: 'Booking not found.' });
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT b.id, b.total_amount, p.payment_status, p.amount
       FROM event_bookings b
       JOIN event_payments p ON p.booking_id = b.id
       WHERE b.id = ? AND b.user_id = ? FOR UPDATE`,
      [Number(match[1]), account.id]
    );
    if (!rows.length) {
      await connection.rollback();
      connection.release();
      connection = null;
      return res.status(404).json({ message: 'Booking not found or payment record is unavailable.' });
    }
    if (Number(rows[0].total_amount) !== Number(rows[0].amount)) {
      await connection.rollback();
      connection.release();
      connection = null;
      return res.status(409).json({ message: 'The saved booking and payment totals do not match. Contact the event organizer.' });
    }

    const newlyConfirmed = rows[0].payment_status === 'PENDING';
    if (newlyConfirmed) {
      await connection.query(
        `UPDATE event_payments
         SET payment_status = 'CONFIRMED', payment_method = 'SIMULATED', confirmed_at = NOW()
         WHERE booking_id = ? AND payment_status = 'PENDING'`,
        [rows[0].id]
      );
    }
    await connection.commit();
    connection.release();
    connection = null;

    let delivery = {};
    if (newlyConfirmed) delivery = await sendReceiptEmail(req.params.bookingId, account.id);
    const receipt = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    if (!receipt) return res.status(404).json({ message: 'Booking not found.' });
    return res.json({
      ...presentBooking(receipt),
      message: newlyConfirmed ? 'Simulated payment confirmed. No money was charged.' : 'Payment was already confirmed.',
      emailStatus: delivery.emailStatus || receipt.email_status,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Payment rollback failed:', rollbackError.code || 'database error');
      } finally {
        connection.release();
      }
    }
    console.error('Payment confirmation failed:', error.code || 'database error');
    return res.status(500).json({ message: 'Unable to confirm the simulated payment. Please try again.' });
  }
});

app.get('/api/bookings/:bookingId/receipt', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to view your receipt.' });
    const receipt = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    return res.json(presentBooking(receipt));
  } catch (error) {
    console.error('Receipt lookup failed:', error.code || 'database error');
    return res.status(500).json({ message: 'Unable to load this receipt.' });
  }
});

app.get('/api/bookings/:bookingId/receipt.pdf', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to download your receipt.' });
    const receipt = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    if (receipt.payment_status !== 'CONFIRMED' || !receipt.confirmed_at || !receipt.receipt_number) {
      return res.status(409).json({ message: 'Confirm the simulated payment before downloading your receipt.' });
    }
    const pdf = await createReceiptPdf(presentBooking(receipt));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TechNova-${receipt.receipt_number}.pdf"`);
    res.setHeader('Content-Length', pdf.length);
    return res.send(pdf);
  } catch (error) {
    console.error('Receipt PDF generation failed:', error.code || 'document error');
    return res.status(500).json({ message: 'Unable to generate your receipt.' });
  }
});

app.get('/api/bookings/:bookingId/receipt/email-status', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to view receipt delivery status.' });
    const receipt = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    return res.json({
      receiptNumber: receipt.receipt_number,
      email: receipt.email,
      emailStatus: receipt.email_status || 'NOT_SENT',
      emailAttempts: Number(receipt.email_attempts || 0),
      emailAttemptStartedAt: receipt.email_attempt_started_at || null,
      message: receipt.email_last_error || null,
    });
  } catch (error) {
    console.error('Receipt email status lookup failed:', error.code || 'database error');
    return res.status(500).json({ message: 'Unable to check receipt delivery status.' });
  }
});

app.post('/api/bookings/:bookingId/receipt/email/retry', async (req, res) => {
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in to retry receipt delivery.' });
    const receipt = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });
    if (receipt.payment_status !== 'CONFIRMED') {
      return res.status(409).json({ message: 'Confirm the simulated payment before sending a receipt.' });
    }
    const delivery = await sendReceiptEmail(req.params.bookingId, account.id);
    if (delivery.emailStatus === 'SENDING') {
      return res.status(409).json({ message: 'Receipt email delivery is already in progress.' });
    }
    const updated = await getOwnedBookingReceipt(account.id, req.params.bookingId);
    return res.json({
      receiptNumber: updated.receipt_number,
      emailStatus: updated.email_status,
      emailAttempts: Number(updated.email_attempts || 0),
      emailAttemptStartedAt: updated.email_attempt_started_at || null,
      message: updated.email_status === 'SENT'
        ? 'Receipt email sent successfully.'
        : 'Payment is confirmed; receipt email could not be sent yet. Please check SMTP configuration and retry.',
    });
  } catch (error) {
    console.error('Receipt email retry failed:', error.code || 'database error');
    return res.status(500).json({ message: 'Unable to retry receipt delivery.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  let connection;
  try {
    const account = await getAccount(req);
    if (!account) return res.status(401).json({ message: 'Sign in before booking tickets.' });
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const department = typeof body.department === 'string' ? body.department.trim() : '';
    const { phone, tickets } = body;

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (email.length > 150 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }
    if (!department || department.length > 100) {
      return res.status(400).json({ message: 'Department is required.' });
    }

    const qty = Number(tickets);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: 'Number of tickets must be at least 1.' });
    }

    const passPrices = { Standard: 0, Gold: 150, Platinum: 280 };
    const seatPrices = { 'Mid Hall': 0, Balcony: 80, 'Front Row': 140, 'VIP Lounge': 250 };
    const addOnPrices = {
      'Workshop Pass': 120,
      'Lunch Coupon': 90,
      Certificate: 60,
      'Priority Parking': 75,
    };
    const attendeeType = ['Student', 'Faculty', 'Guest', 'VIP'].includes(body.attendeeType)
      ? body.attendeeType
      : 'Student';
    const accessPass = Object.prototype.hasOwnProperty.call(passPrices, body.accessPass)
      ? body.accessPass
      : 'Standard';
    const seatZone = Object.prototype.hasOwnProperty.call(seatPrices, body.seatZone)
      ? body.seatZone
      : 'Mid Hall';
    const requestedAddOns = Array.isArray(body.addOns) ? body.addOns : [];
    if (requestedAddOns.length > Object.keys(addOnPrices).length
      || requestedAddOns.some((item) => !Object.prototype.hasOwnProperty.call(addOnPrices, item))) {
      return res.status(400).json({ message: 'One or more selected add-ons are not available.' });
    }
    const addOns = [...new Set(requestedAddOns)];
    const specialNotes = typeof body.specialNotes === 'string' ? body.specialNotes.trim() : '';
    if (specialNotes.length > 500) {
      return res.status(400).json({ message: 'Special notes must be 500 characters or fewer.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [settings] = await connection.query(
      'SELECT initial_tickets, ticket_price FROM event_settings ORDER BY id DESC LIMIT 1 FOR UPDATE'
    );
    const initialTickets = settings.length ? Number(settings[0].initial_tickets) : EVENT_CONFIG.initialTickets;
    const ticketPrice = settings.length ? Number(settings[0].ticket_price) : EVENT_CONFIG.ticketPrice;
    const [soldRows] = await connection.query('SELECT COALESCE(SUM(tickets), 0) AS sold FROM event_bookings');
    const availableTickets = Math.max(0, initialTickets - Number(soldRows[0].sold || 0));
    if (qty > availableTickets) {
      await connection.rollback();
      return res.status(400).json({
        message: `Only ${availableTickets} tickets are currently available.`,
      });
    }

    const addOnTotal = addOns.reduce((total, item) => total + addOnPrices[item], 0);
    const totalAmount = qty * (ticketPrice + passPrices[accessPass] + seatPrices[seatZone]) + addOnTotal;
    const [result] = await connection.query(
      `INSERT INTO event_bookings
       (user_id, name, email, department, phone, tickets, total_amount, ticket_price, attendee_type, access_pass, seat_zone, add_ons, special_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        name.trim(),
        email.trim(),
        department.trim(),
        typeof phone === 'string' ? phone.trim().slice(0, 30) : null,
        qty,
        totalAmount.toFixed(2),
        ticketPrice,
        attendeeType,
        accessPass,
        seatZone,
        JSON.stringify(addOns),
        specialNotes,
      ]
    );
    const receiptNumber = formatReceiptNumber(result.insertId);
    await connection.query(
      `INSERT INTO event_payments
       (booking_id, receipt_number, amount, payment_status, payment_method, email_status)
       VALUES (?, ?, ?, 'PENDING', 'SIMULATED', 'NOT_SENT')`,
      [result.insertId, receiptNumber, totalAmount.toFixed(2)]
    );
    await connection.commit();
    connection.release();
    connection = null;
    const remainingTickets = Math.max(0, availableTickets - qty);
    const bookingId = `BK${String(result.insertId).padStart(6, '0')}`;

    return res.status(201).json({
      bookingId,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      tickets: qty,
      ticketPrice,
      totalAmount,
      paymentStatus: 'PENDING',
      receiptNumber,
      paymentMethod: 'SIMULATED',
      confirmedAt: null,
      emailStatus: 'NOT_SENT',
      attendeeType,
      accessPass,
      seatZone,
      addOns,
      specialNotes,
      remainingTickets,
      message: 'Booking reserved. Complete the simulated payment to confirm.',
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Booking rollback error:', rollbackError);
      } finally {
        connection.release();
      }
    }
    console.error('Booking error:', error);
    return res.status(500).json({ message: 'Unable to save booking. Please try again.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Project 1 backend is running.', databaseAvailable });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found.' });
  }
  return res.sendFile(path.join(__dirname, 'dist', 'index.html'), (error) => {
    if (error) next();
  });
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Project 1 backend running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
