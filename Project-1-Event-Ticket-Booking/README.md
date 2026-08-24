# Project 1 — Internal Department Event Ticket Booking System

Simple React application demonstrating ticket booking for an internal event (TechNova 2026).

Features
- View event details
- Book tickets with validation
- Dynamic available ticket count
- Booking confirmation and summary
- Reset form functionality (does not restore tickets)

Tech
- React, Vite, JavaScript, CSS

Run
1. Install dependencies:
```
npm install
```
2. Start dev server:
```
npm run dev
```
Open http://localhost:5173 (Vite default) in your browser.

Structure
- src/components: `Header`, `EventDetails`, `BookingForm`, `BookingSummary`, `ErrorMessage`
- `App.jsx` holds main state: available tickets, booking summary, confirmation.

Validation rules
- Name required and basic name format
- Email required and valid format
- Department required
- Tickets must be integer >=1 and <= available tickets

Notes
- No backend; all state in React.
- Booking ID generated client-side.
