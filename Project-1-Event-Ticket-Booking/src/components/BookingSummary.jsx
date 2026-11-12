import React, { useEffect, useState } from 'react'

const confettiColors = ['#fa6b53', '#f7be45', '#7ac9a5', '#9676d4', '#52b9cd']

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function downloadTicket(summary) {
  const details = [
    ['Booking ID', summary.bookingId],
    ['Attendee', summary.name],
    ['Email', summary.email],
    ['Phone', summary.phone],
    ['Department', summary.department],
    ['Event', summary.eventName],
    ['Date and time', summary.eventDateTime],
    ['Venue', summary.venue],
    ['Tickets', `${summary.tickets} × ₹${summary.ticketPrice}`],
    ['Attendee profile', summary.attendeeType],
    ['Access pass', summary.accessPass],
    ['Seat zone', summary.seatZone],
    ['Add-ons', summary.addOns?.join(', ')],
    ['Special notes', summary.specialNotes],
    ['Total amount', `₹${summary.totalAmount}`],
  ].filter(([, value]) => value)

  const rows = details.map(([label, value]) => (
    `<div class="row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
  )).join('')
  const ticket = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TechNova ticket ${escapeHtml(summary.bookingId)}</title><style>*{box-sizing:border-box}body{margin:0;padding:40px 18px;background:#070a19;color:#f5f2ff;font-family:Arial,sans-serif}.ticket{max-width:680px;margin:auto;border:1px solid #9a42e7;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#14132e,#0c1022);box-shadow:0 20px 55px #0008}.head{padding:27px;background:linear-gradient(110deg,#30105e,#11132e);border-bottom:1px solid #8e36ce}.eyebrow{color:#d66bff;font-size:11px;letter-spacing:.18em}.head h1{margin:10px 0;font-size:27px}.head p{color:#c8bfdc}.details{padding:17px 27px}.row{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-bottom:1px solid #ffffff20}.row span{color:#bab4ce;text-transform:capitalize}.row strong{text-align:right}.footer{margin:0 27px 27px;padding:20px;border:1px dashed #bb55f5;border-radius:12px;color:#e5ccff;text-align:center}@media print{body{padding:0;background:#fff}.ticket{box-shadow:none}}</style><article class="ticket"><header class="head"><div class="eyebrow">EVENT TICKET BOOKING · TECHNOVA 2026</div><h1>Your ticket is confirmed 🎉</h1><p>${escapeHtml(summary.eventName)}</p></header><section class="details">${rows}</section><footer class="footer">Keep this ticket for your TechNova event. Booking reference: ${escapeHtml(summary.bookingId)}</footer></article></html>`

  const downloadUrl = URL.createObjectURL(new Blob([ticket], { type: 'text/html;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `TechNova-${summary.bookingId}.html`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
}

export default function BookingSummary({ summary, onNavigate, onReceiptUpdated }) {
  const [working, setWorking] = useState(false)
  const [actionError, setActionError] = useState('')
  const [staleEmailSending, setStaleEmailSending] = useState(false)
  const isPaid = summary.paymentStatus === 'CONFIRMED'

  useEffect(() => {
    setStaleEmailSending(false)
    if (summary.emailStatus !== 'SENDING' || !summary.emailAttemptStartedAt) return undefined
    const attemptStarted = new Date(summary.emailAttemptStartedAt).getTime()
    if (!Number.isFinite(attemptStarted)) return undefined
    const delay = Math.max(0, attemptStarted + 10 * 60 * 1000 - Date.now() + 1000)
    const timeout = window.setTimeout(() => setStaleEmailSending(true), delay)
    return () => window.clearTimeout(timeout)
  }, [summary.emailAttemptStartedAt, summary.emailStatus])

  async function updateReceipt(url, options, failureMessage) {
    setWorking(true)
    setActionError('')
    try {
      const response = await fetch(url, { credentials: 'same-origin', ...options })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || failureMessage)
      return data
    } catch (error) {
      setActionError(error.message || failureMessage)
      return null
    } finally {
      setWorking(false)
    }
  }

  async function confirmPayment() {
    const receipt = await updateReceipt(
      `/api/bookings/${encodeURIComponent(summary.bookingId)}/payment/confirm`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: true }) },
      'Unable to confirm the simulated payment.'
    )
    if (receipt) onReceiptUpdated(receipt)
  }

  async function retryEmail() {
    const result = await updateReceipt(
      `/api/bookings/${encodeURIComponent(summary.bookingId)}/receipt/email/retry`,
      { method: 'POST' },
      'Unable to retry receipt delivery.'
    )
    if (result) {
      onReceiptUpdated({
        ...summary,
        emailStatus: result.emailStatus,
        emailAttempts: result.emailAttempts,
        emailAttemptStartedAt: result.emailAttemptStartedAt,
      })
    }
  }

  async function downloadReceipt() {
    setWorking(true)
    setActionError('')
    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(summary.bookingId)}/receipt.pdf`,
        { credentials: 'same-origin' }
      )
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Unable to download your receipt.')
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `TechNova-${summary.receiptNumber}.pdf`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      setActionError(error.message || 'Unable to download your receipt.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <article className="confirmation-card">
      <div className="celebration-stage" aria-label={isPaid ? 'Payment confirmed' : 'Booking reserved, payment pending'}>
        {isPaid && <div className="confetti-field" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <span
              className="confetti-piece"
              key={index}
              style={{
                '--confetti-left': `${(index * 37 + 5) % 100}%`,
                '--confetti-delay': `${(index % 12) * -0.31}s`,
                '--confetti-color': confettiColors[index % confettiColors.length],
                '--confetti-rotation': `${(index * 43) % 180}deg`,
              }}
            />
          ))}
        </div>}
        <span className="celebration-icon" aria-hidden="true">{isPaid ? '🎉' : '🎟️'}</span>
        <p className="celebration-kicker">{isPaid ? 'PAYMENT CONFIRMED' : 'BOOKING RESERVED'}</p>
        <h1>{isPaid ? 'Congratulations! 🎊' : 'One last step'}</h1>
        <p className="celebration-copy">
          {isPaid
            ? 'Your simulated payment is confirmed. We can’t wait to see you at TechNova.'
            : 'Confirm the demo payment below to complete your booking. No real payment is processed.'}
        </p>
        {isPaid && <span className="party-emojis" aria-hidden="true">🥳 &nbsp; 🎈 &nbsp; ✨ &nbsp; 🎊</span>}
      </div>

      <section className="ticket-details">
        <div className={`payment-confirmation-panel ${isPaid ? 'payment-confirmed' : 'payment-pending'}`}>
          <div>
            <p className="hero-kicker">SIMULATED PAYMENT</p>
            <h2>{isPaid ? 'Payment confirmed' : 'Payment pending'}</h2>
            <p>
              {isPaid
                ? `Receipt ${summary.receiptNumber} · ${summary.paymentMethod === 'SIMULATED' ? 'Academic demo payment' : summary.paymentMethod}`
                : 'This is a demo confirmation only. No card or banking details are collected and no money is charged.'}
            </p>
            {isPaid && summary.confirmedAt && (
              <p className="payment-confirmed-time">Confirmed {new Date(summary.confirmedAt).toLocaleString()}</p>
            )}
          </div>
          {!isPaid && (
            <button type="button" className="primary-button" disabled={working} onClick={confirmPayment}>
              {working ? 'Confirming…' : 'Confirm demo payment'}
            </button>
          )}
        </div>

        {isPaid && (
          <div className={`receipt-email-status email-${String(summary.emailStatus || 'NOT_SENT').toLowerCase()}`} role="status">
            <span>
              {summary.emailStatus === 'SENT'
                ? `Receipt emailed to ${summary.email}.`
                : summary.emailStatus === 'SENDING'
                  ? staleEmailSending
                    ? `Receipt delivery to ${summary.email} may have stopped.`
                    : `Sending receipt to ${summary.email}…`
                  : `Payment is confirmed, but the receipt email was not delivered to ${summary.email}.`}
            </span>
            {summary.emailStatus !== 'SENT' && (summary.emailStatus !== 'SENDING' || staleEmailSending) && (
              <button type="button" className="text-link" disabled={working} onClick={retryEmail}>
                {working ? 'Retrying…' : summary.emailStatus === 'SENDING' ? 'Retry delivery' : 'Retry email'}
              </button>
            )}
          </div>
        )}
        {actionError && <p className="payment-action-error" role="alert">{actionError}</p>}

        <div className="ticket-details-heading"><div><p className="hero-kicker">YOUR EVENT PASS</p><h2>Booking details</h2></div><span className={`confirmed-pill ${isPaid ? '' : 'booking-pending-pill'}`}><span className="live-dot" /> {isPaid ? 'PAYMENT CONFIRMED' : 'PAYMENT PENDING'}</span></div>
        <div className="confirmation-ticket">
          <div className="confirmation-ticket-stub" aria-hidden="true">
            <span className="ticket-symbol" />
            <strong>TECHNOVA</strong>
            <small>2026</small>
            <span className="stub-booking-code">{summary.bookingId}</span>
          </div>
          <div className="ticket-detail-grid">
            <div className="ticket-detail-item ticket-detail-wide"><span>EVENT</span><strong>{summary.eventName}</strong></div>
            <div className="ticket-detail-item"><span>BOOKING ID</span><strong className="booking-code">{summary.bookingId}</strong></div>
            <div className="ticket-detail-item"><span>ATTENDEE</span><strong>{summary.name}</strong></div>
            <div className="ticket-detail-item"><span>EMAIL</span><strong>{summary.email}</strong></div>
            {!!summary.phone && <div className="ticket-detail-item"><span>PHONE</span><strong>{summary.phone}</strong></div>}
            <div className="ticket-detail-item"><span>DEPARTMENT</span><strong>{summary.department}</strong></div>
            {!!summary.eventDateTime && <div className="ticket-detail-item"><span>DATE & TIME</span><strong>{summary.eventDateTime}</strong></div>}
            {!!summary.venue && <div className="ticket-detail-item"><span>VENUE</span><strong>{summary.venue}</strong></div>}
            <div className="ticket-detail-item"><span>TICKETS</span><strong>{summary.tickets} × ₹{summary.ticketPrice}</strong></div>
            <div className="ticket-detail-item"><span>ATTENDEE PROFILE</span><strong>{summary.attendeeType}</strong></div>
            <div className="ticket-detail-item"><span>ACCESS PASS</span><strong>{summary.accessPass}</strong></div>
            <div className="ticket-detail-item"><span>SEAT ZONE</span><strong>{summary.seatZone}</strong></div>
            {!!summary.addOns?.length && <div className="ticket-detail-item ticket-detail-wide"><span>ADD-ONS</span><strong>{summary.addOns.join(' · ')}</strong></div>}
            {!!summary.specialNotes && <div className="ticket-detail-item ticket-detail-wide"><span>YOUR NOTES</span><strong>{summary.specialNotes}</strong></div>}
          </div>
        </div>
        <div className="ticket-total"><span>Total amount</span><strong>₹{summary.totalAmount}</strong></div>
        <div className="ticket-actions">
          {isPaid && <button type="button" className="primary-button" disabled={working} onClick={downloadReceipt}>Download Receipt PDF <span aria-hidden="true">↓</span></button>}
          {isPaid && <button type="button" className="ticket-outline-button" onClick={() => downloadTicket(summary)}>Download Ticket</button>}
          <button type="button" className="ticket-outline-button" onClick={() => onNavigate('/tickets')}>▣ &nbsp; View My Bookings</button>
          <button type="button" className="ticket-outline-button" onClick={() => window.print()}>Print</button>
          <button type="button" className="ticket-outline-button" onClick={() => onNavigate('/')}>⌂ &nbsp; Back to Home</button>
        </div>
      </section>
    </article>
  )
}
