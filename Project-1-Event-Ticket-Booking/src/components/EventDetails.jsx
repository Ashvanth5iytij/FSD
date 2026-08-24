import React from 'react'

export default function EventDetails({event, availableTickets}){
  return (
    <div className="card">
      <h2>{event.name}</h2>
      <p className="muted">{event.department}</p>
      <div className="summary-row"><strong>Date & Time:</strong> {event.dateTime}</div>
      <div className="summary-row"><strong>Venue:</strong> {event.venue}</div>
      <div className="summary-row"><strong>Ticket Price:</strong> ₹{event.ticketPrice}</div>
      <div className="summary-row"><strong>Available Tickets:</strong> {availableTickets > 0 ? availableTickets : 'Sold Out'}</div>
    </div>
  )
}
