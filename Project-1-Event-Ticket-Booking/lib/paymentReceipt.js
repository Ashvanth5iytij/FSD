const PDFDocument = require('pdfkit');

function formatReceiptNumber(bookingId) {
  return `TN26-${String(bookingId).padStart(10, '0')}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function receiptRows(receipt) {
  return [
    ['Event', receipt.eventName],
    ['Event date and time', receipt.eventDateTime],
    ['Venue', receipt.venue],
    ['Booking ID', receipt.bookingId],
    ['Receipt number', receipt.receiptNumber],
    ['Customer name', receipt.name],
    ['Customer email', receipt.email],
    ['Department', receipt.department],
    ['Phone', receipt.phone || 'Not provided'],
    ['Tickets', `${receipt.tickets} × INR ${Number(receipt.ticketPrice).toFixed(2)}`],
    ['Attendee type', receipt.attendeeType],
    ['Access pass', receipt.accessPass],
    ['Seat zone', receipt.seatZone],
    ['Add-ons', receipt.addOns?.length ? receipt.addOns.join(', ') : 'None'],
    ['Total amount', `INR ${Number(receipt.totalAmount).toFixed(2)}`],
    ['Payment status', receipt.paymentStatus],
    ['Payment confirmed', receipt.confirmedAt ? new Date(receipt.confirmedAt).toLocaleString() : 'Not confirmed'],
  ];
}

function buildReceiptEmail(receipt) {
  const rows = receiptRows(receipt);
  const htmlRows = rows.map(([label, value]) => (
    `<tr><th style="padding:10px 12px;text-align:left;color:#c7bddb;border-bottom:1px solid #342a50">${escapeHtml(label)}</th><td style="padding:10px 12px;text-align:right;color:#f5f0ff;border-bottom:1px solid #342a50">${escapeHtml(value)}</td></tr>`
  )).join('');
  const text = [
    'TechNova 2026 payment receipt',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'This is an academic demo payment confirmation. No money was charged.',
  ].join('\n');

  return {
    subject: `TechNova payment receipt ${receipt.receiptNumber}`,
    text,
    html: `<!doctype html><html lang="en"><meta charset="utf-8"><body style="margin:0;padding:24px;background:#080b1b;color:#f5f0ff;font-family:Arial,sans-serif"><main style="max-width:680px;margin:auto;padding:26px;border:1px solid #7541a9;border-radius:16px;background:#11132a"><p style="color:#d472ff;font-size:12px;letter-spacing:2px">TECHNOVA 2026 · PAYMENT RECEIPT</p><h1 style="font-size:24px">Payment confirmed</h1><p style="color:#c7bddb">Your simulated payment is confirmed. No money was charged.</p><table style="width:100%;border-collapse:collapse">${htmlRows}</table><p style="margin-top:22px;color:#ada5bf;font-size:12px">Keep this email for your event records.</p></main></body></html>`,
  };
}

function createReceiptPdf(receipt) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `TechNova receipt ${receipt.receiptNumber}` } });
    const chunks = [];
    document.on('data', (chunk) => chunks.push(chunk));
    document.once('error', reject);
    document.once('end', () => resolve(Buffer.concat(chunks)));

    document.fillColor('#51228c').fontSize(10).text('TECHNOVA 2026 · DEPARTMENT TECHNICAL FEST', { characterSpacing: 1.2 });
    document.moveDown(0.7);
    document.fillColor('#161226').fontSize(24).text('Payment Receipt');
    document.moveDown(0.3);
    document.fillColor('#39845f').fontSize(12).text(`PAYMENT ${receipt.paymentStatus}`);
    document.moveDown(1.2);

    for (const [label, value] of receiptRows(receipt)) {
      document.fillColor('#686274').fontSize(9).text(label.toUpperCase(), { continued: true, width: 180 });
      document.fillColor('#171424').fontSize(10).text(String(value), { align: 'right' });
      document.moveTo(48, document.y + 5).lineTo(547, document.y + 5).strokeColor('#e5e0eb').stroke();
      document.moveDown(0.7);
    }

    document.moveDown(0.6);
    document.fillColor('#6f38a5').fontSize(9).text('Academic demonstration only. No real payment was processed or charged.');
    document.end();
  });
}

module.exports = { buildReceiptEmail, createReceiptPdf, escapeHtml, formatReceiptNumber, receiptRows };
