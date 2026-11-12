const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');
const { buildReceiptEmail, createReceiptPdf, escapeHtml, formatReceiptNumber } = require('../lib/paymentReceipt');

const receipt = {
  bookingId: 'BK000012',
  receiptNumber: formatReceiptNumber(12),
  eventName: 'TechNova 2026 – Department Technical Fest',
  name: 'Taylor Example',
  email: 'taylor@example.com',
  department: 'Computer Science',
  phone: '+91 98765 43210',
  tickets: 2,
  ticketPrice: 100,
  totalAmount: 200,
  attendeeType: 'Student',
  accessPass: 'Standard',
  seatZone: 'Mid Hall',
  addOns: ['Workshop Pass'],
  paymentStatus: 'CONFIRMED',
  confirmedAt: new Date('2026-11-12T10:00:00.000Z'),
};

test('receipt numbers are stable and unique per booking ID', () => {
  assert.equal(formatReceiptNumber(12), 'TN26-0000000012');
  assert.notEqual(formatReceiptNumber(12), formatReceiptNumber(13));
});

test('receipt email escapes attendee-provided HTML and includes receipt details', () => {
  const mail = buildReceiptEmail({ ...receipt, name: '<img src=x onerror=alert(1)>' });
  assert.match(mail.subject, /TN26-0000000012/);
  assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(mail.html, /<img src=x/);
  assert.match(mail.text, /TechNova 2026/);
  assert.match(mail.text, /INR 200\.00/);
  assert.match(mail.text, /No money was charged/);
  assert.equal(escapeHtml(`'&"<>`), '&#39;&amp;&quot;&lt;&gt;');
});

test('receipt PDF is generated as a valid PDF document', async () => {
  const pdf = await createReceiptPdf(receipt);
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 1000);
});

test('payment and receipt APIs reject unauthenticated access', async (t) => {
  const routes = [
    ['get', '/api/bookings/BK000012/receipt'],
    ['get', '/api/bookings/BK000012/receipt.pdf'],
    ['get', '/api/bookings/BK000012/receipt/email-status'],
    ['post', '/api/bookings/BK000012/payment/confirm'],
    ['post', '/api/bookings/BK000012/receipt/email/retry'],
  ];

  for (const [method, route] of routes) {
    await t.test(`${method.toUpperCase()} ${route}`, async () => {
      const response = await request(app)[method](route).send({ confirm: true });
      assert.equal(response.status, 401);
    });
  }
});
