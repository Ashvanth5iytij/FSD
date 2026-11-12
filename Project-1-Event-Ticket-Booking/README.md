# TechNova Event Ticket Booking

A React and Express ticket-booking website with public event information, account registration and sign-in, persistent ticket bookings, and printable booking confirmations.

## Features

- Animated event landing page and live availability from the database.
- Account registration, password-based sign-in, and sign-out.
- MySQL-backed accounts, sessions, ticket inventory, and bookings.
- Per-account booking history and shareable-after-sign-in confirmation pages.
- Server-side validation and authoritative ticket pricing.
- Responsive layouts, reduced-motion support, and printable confirmations.
- Explicit simulated-payment confirmation (no payment gateway or real charge).
- Unique payment receipt numbers, downloadable PDF receipts, and SMTP email receipts with retry status.

## Run locally

1. Install Node.js and MySQL.
2. Copy `.env.example` to `.env` and set the database connection values for your MySQL server. Keep `.env` private. The example uses the standard MySQL port `3306`; use your server's configured port if different.
3. If using the bundled local MySQL instance, start `start_mysql_local.cmd` in its own terminal and set `DB_PORT=3307` in `.env`.
4. Install packages with `npm install`.
5. For a fresh database, import `database/schema.sql`. For an existing installation, apply only the additive migration described below before starting the API.
6. In one terminal run `npm run server` to start the API.
7. In another terminal run `npm run dev`, then open the Vite URL (normally `http://localhost:5173`).

Vite forwards API requests to `http://localhost:5000`. The API refuses to start without MySQL; it does not pretend that temporary in-memory bookings are permanent.

## Payment and receipt database migration

The existing `event_accounts`, `event_sessions`, `event_bookings`, and `event_settings` tables are preserved. For an existing installation, back up `event_ticket_booking`, then apply this additive migration once from Command Prompt (the MySQL password is entered at the prompt, not saved in the command):

```bat
mysql --host=localhost --port=3306 --user=project1user --password event_ticket_booking < database\migrations\20261112_add_event_payments.sql
```

Use an authorized database account with permission to create a table and insert rows. Change the command's port if `.env` uses a different MySQL port. The migration adds `event_payments`, a one-to-one booking relationship, unique receipt numbers, simulated-payment state, and email delivery status. Existing bookings receive `PENDING` payment records; migration does not imply that historical bookings were paid. It does not delete or rewrite existing accounts or bookings. The application checks that the payment table exists and will ask for the migration if it has not been applied.

For a fresh database, import the complete schema:

```bat
mysql --host=localhost --port=3306 --user=project1user --password < database\schema.sql
```

`database/schema.sql` includes the new payments table. The schema file creates the database and application tables, so use it only for a fresh installation; use the additive migration for an existing database.

## SMTP receipt email configuration

Copy the SMTP placeholders from `.env.example` into the private project `.env` and set:

- `SMTP_HOST`: SMTP server hostname.
- `SMTP_PORT`: usually `587` for STARTTLS or `465` for implicit TLS.
- `SMTP_SECURE`: `false` for port 587; `true` for port 465.
- `SMTP_USER` and `SMTP_PASSWORD`: SMTP credentials (use a provider/app password where available).
- `SMTP_FROM`: verified sender name/address.

SMTP values are server-only. Never add them to frontend/Vite-prefixed variables or commit `.env`. Without SMTP configuration, demo payment confirmation still persists; email status is marked failed and can be retried after SMTP is configured. A retry sends only the already-confirmed receipt; it does not create another booking or payment.

## Testing simulated payment and email

Run the frontend build and backend tests:

```sh
npm run build
npm test
```

Sign in, create a booking, and open its confirmation page. The payment remains `PENDING` until the user explicitly clicks **Confirm demo payment**. This action only records an academic simulation; it never accepts card/bank details or charges money. After confirmation, check the receipt number and email status, use **Download Receipt PDF**, and use **Retry email** if delivery failed. Verify the receipt email and PDF attachment at the booking email address when SMTP is configured.

## Production hosting

Build the frontend with `npm run build`, then run `npm start`. The Express server serves the built website and API together. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, and `NODE_ENV=production` in your hosting provider's environment settings. Use a managed MySQL database with persistent backups, HTTPS, and a hosting provider that keeps the Node process running. Keep the frontend and API on this same origin; separate-origin hosting needs additional cookie and CORS configuration.

This is a college event-ticket-booking project. It is not affiliated with or connected to any railway, train-ticketing, or railway-department service. For a college-project demonstration, run the app locally using the steps above. Publishing it publicly would require choosing a hosting provider and configuring its database separately.
