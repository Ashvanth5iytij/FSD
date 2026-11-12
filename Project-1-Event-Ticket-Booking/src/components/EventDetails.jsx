import React from 'react'

export default function EventDetails({event, availableTickets}){
  return (
    <div className="card event-details-card">
      <div className="booking-event-art" aria-hidden="true">
        <span className="catalog-art-orbit" />
        <span className="catalog-tech-symbol">&lt;/&gt;</span>
        <span className="catalog-art-chip">✳</span>
        <span className="catalog-art-laptop"><span>TECH<br />NOVA</span></span>
        <span className="catalog-art-stars">✦ &nbsp; · &nbsp; ✦</span>
        <span className="catalog-category">FEATURED EVENT</span>
      </div>
      <div className="booking-event-content">
        <p className="eyebrow">DEPARTMENT TECHNICAL FEST</p>
        <h2>{event.name}</h2>
        <p className="muted">{event.department}</p>
        <div className="booking-event-meta">
          <div className="summary-row"><strong>▦</strong> {event.dateTime}</div>
          <div className="summary-row"><strong>⌖</strong> {event.venue}</div>
          <div className="summary-row"><strong>₹</strong> ₹{event.ticketPrice} per ticket</div>
          <div className="summary-row booking-availability"><span className="live-dot" /> {availableTickets > 0 ? `${availableTickets} tickets available` : 'Sold out'}</div>
        </div>
      </div>
    </div>
  )
}
