import React from 'react'

export default function BookingSummary({summary, confirmation}){
  if(!summary) return (
    <div className="card">
      <h3>Booking Summary</h3>
      <p className="muted">No booking yet.</p>
    </div>
  )

  return (
    <div className="card">
      <h3>Booking Summary</h3>
      {confirmation && <div style={{color:'green',marginBottom:8}}>{confirmation}</div>}
      <div className="summary-row"><strong>Name:</strong> {summary.name}</div>
      <div className="summary-row"><strong>Event:</strong> {summary.eventName}</div>
      <div className="summary-row"><strong>Tickets Booked:</strong> {summary.tickets}</div>
      <div className="summary-row"><strong>Ticket Price:</strong> ₹{summary.ticketPrice}</div>
      <div className="summary-row"><strong>Total Amount:</strong> ₹{summary.totalAmount}</div>
      <div className="summary-row"><strong>Booking ID:</strong> {summary.bookingId}</div>
      <div className="summary-row"><strong>Remaining Tickets:</strong> {summary.remainingTickets}</div>
    </div>
  )
}
